"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Plus, RotateCw, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { revalidatePublicSettings } from "@/app/admin/actions";
import type { AdminField, AdminImageBucket, AdminLookupTable, AdminModule } from "@/lib/admin/modules";
import { createClient } from "@/lib/supabase/client";

type Row = Record<string, unknown> & { id?: string | number };
type Lookup = { id: string; label: string };
type UploadedObject = { bucket: AdminImageBucket; path: string };

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function imageObjectPath(url: string, bucket: AdminImageBucket): string | null {
  try {
    const path = new URL(url).pathname;
    const prefix = `/storage/v1/object/public/${bucket}/`;
    return path.startsWith(prefix) ? decodeURIComponent(path.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

function imageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]{1,8}$/.test(extension)) return extension;
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  return "webp";
}

function formatLocalDateTime(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fieldValue(field: AdminField, value: unknown): string | boolean {
  if (field.type === "boolean") return value === true;
  if (value == null) return "";
  return field.type === "datetime" ? formatLocalDateTime(value) : String(value);
}

function emptyValue(field: AdminField): string | boolean {
  if (field.type === "boolean") return false;
  if (field.type === "number") return field.required ? "0" : "";
  if (field.type === "datetime") return formatLocalDateTime(new Date().toISOString());
  if (field.type === "select" && field.options?.length) return field.options[0].value;
  return "";
}

function cellValue(value: unknown, field?: AdminField, lookups?: Partial<Record<AdminLookupTable, Lookup[]>>) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (field?.lookup) {
    const found = lookups?.[field.lookup.table]?.find((item) => item.id === String(value));
    if (found) return found.label;
  }
  if (field?.type === "datetime" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }
  const stringValue = String(value);
  return stringValue.length > 72 ? `${stringValue.slice(0, 69)}…` : stringValue;
}

export function AdminWorkspace({ module }: { module: AdminModule }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [lookups, setLookups] = useState<Partial<Record<AdminLookupTable, Lookup[]>>>({});
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlsRef = useRef(previewUrls);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = supabase.from(module.table).select("*");
    if (module.filter === "knockout") query.neq("round", "group");
    if (module.table === "news") query.order("published_at", { ascending: false });
    else if (module.table === "gallery" || module.table === "sponsors" || module.table === "groups") query.order("sort_order", { ascending: true });
    else if (module.table === "matches") query.order("kickoff_at", { ascending: true });
    else if (module.table === "players") query.order("name", { ascending: true });
    else if (module.table === "teams") query.order("name", { ascending: true });
    else if (module.table === "match_events") query.order("minute", { ascending: true });

    const { data, error: queryError } = await query;
    if (queryError) {
      setError(`Could not load ${module.title.toLowerCase()}: ${queryError.message}`);
      setLoading(false);
      return;
    }
    setRows((data ?? []) as Row[]);

    const lookupFields = module.fields.filter((field) => field.lookup);
    const tables = [...new Set(lookupFields.map((field) => field.lookup!.table))];
    const results = await Promise.all(tables.map(async (table) => {
      const { data: lookupRows, error: lookupError } = await supabase.from(table).select("*");
      if (lookupError) throw new Error(`Could not load ${table}: ${lookupError.message}`);
      return [table, (lookupRows ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        label: table === "matches"
          ? `${new Date(String(row.kickoff_at)).toLocaleString()} · ${row.round ?? "match"}`
          : String(row.name ?? row.title ?? row.id),
      }))] as const;
    })).catch((lookupError: Error) => {
      setError(lookupError.message);
      return [];
    });
    setLookups(Object.fromEntries(results) as Partial<Record<AdminLookupTable, Lookup[]>>);
    setLoading(false);
  }, [module, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => () => {
    Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function selectImage(field: AdminField, file: File | null) {
    const oldPreview = previewUrls[field.name];
    if (oldPreview) URL.revokeObjectURL(oldPreview);

    setSelectedFiles((current) => {
      const next = { ...current };
      if (file) next[field.name] = file;
      else delete next[field.name];
      return next;
    });
    setPreviewUrls((current) => {
      const next = { ...current };
      if (file) next[field.name] = URL.createObjectURL(file);
      else delete next[field.name];
      return next;
    });
  }

  function startCreate() {
    setEditingId(null);
    setCreating(true);
    setNotice(null);
    setError(null);
    setSelectedFiles({});
    setValues(Object.fromEntries(module.fields.map((field) => {
      const lookupsForField = field.lookup ? lookups[field.lookup.table] : undefined;
      const initial = field.lookup
        ? field.required ? lookupsForField?.[0]?.id ?? "" : ""
        : emptyValue(field);
      return [field.name, initial];
    })));
  }

  function startEdit(row: Row) {
    setCreating(false);
    setEditingId(row.id ?? null);
    setNotice(null);
    setError(null);
    setSelectedFiles({});
    setValues(Object.fromEntries(module.fields.map((field) => [field.name, fieldValue(field, row[field.name])])));
  }

  function cancelEdit() {
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setSelectedFiles({});
    setCreating(false);
    setEditingId(null);
    setValues({});
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload: Record<string, string | number | boolean | null> = {};

    for (const field of module.fields) {
      const raw = values[field.name];
      if (field.type === "image") {
        payload[field.name] = raw === "" ? null : String(raw);
        continue;
      }
      if (field.type === "boolean") payload[field.name] = raw === true;
      else if (field.type === "number") payload[field.name] = raw === "" ? null : Number(raw);
      else if (field.type === "datetime") payload[field.name] = raw ? new Date(String(raw)).toISOString() : null;
      else payload[field.name] = raw === "" ? null : String(raw);
    }

    const recordId = module.singleton ? "1" : editingId?.toString() ?? crypto.randomUUID();
    if (!module.singleton && editingId === null && module.fields.some((field) => field.type === "image")) {
      payload.id = recordId;
    }
    const uploadedObjects: UploadedObject[] = [];
    const replacedObjects: UploadedObject[] = [];

    for (const field of module.fields.filter((item) => item.type === "image" && item.image)) {
      const file = selectedFiles[field.name];
      if (!file || !field.image) continue;

      const maxBytes = field.image.maxSizeMB * 1024 * 1024;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`${field.label}: choose a JPG, PNG or WebP image.`);
        setSaving(false);
        return;
      }
      if (file.size > maxBytes) {
        setError(`${field.label}: the image must be ${field.image.maxSizeMB} MB or smaller.`);
        setSaving(false);
        return;
      }

      const path = `${recordId}/${field.name}-${crypto.randomUUID()}.${imageExtension(file)}`;
      const { error: uploadError } = await supabase.storage
        .from(field.image.bucket)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (uploadError) {
        const cleanup = await Promise.all(uploadedObjects.map(({ bucket, path: uploadedPath }) =>
          supabase.storage.from(bucket).remove([uploadedPath]),
        ));
        const cleanupFailed = cleanup.some((result) => result.error);
        setError(`Could not upload ${field.label.toLowerCase()}: ${uploadError.message}${cleanupFailed ? " Some earlier uploaded files could not be removed." : ""}`);
        setSaving(false);
        return;
      }

      uploadedObjects.push({ bucket: field.image.bucket, path });
      const previousUrl = values[field.name];
      if (typeof previousUrl === "string" && previousUrl) {
        const previousPath = imageObjectPath(previousUrl, field.image.bucket);
        if (previousPath) replacedObjects.push({ bucket: field.image.bucket, path: previousPath });
      }
      payload[field.name] = supabase.storage.from(field.image.bucket).getPublicUrl(path).data.publicUrl;
    }

    let result;
    if (module.singleton) {
      payload.id = 1;
      result = await supabase.from(module.table).upsert(payload, { onConflict: "id" });
    } else if (editingId !== null) {
      result = await supabase.from(module.table).update(payload).eq("id", editingId);
    } else {
      result = await supabase.from(module.table).insert(payload);
    }

    if (result.error) {
      const cleanup = await Promise.all(uploadedObjects.map(({ bucket, path }) =>
        supabase.storage.from(bucket).remove([path]),
      ));
      const cleanupFailed = cleanup.some((item) => item.error);
      setError(`Could not save changes: ${result.error.message}${cleanupFailed ? " Some uploaded files could not be removed." : ""}`);
      setSaving(false);
      return;
    }

    const cleanup = await Promise.all(replacedObjects.map(({ bucket, path }) =>
      supabase.storage.from(bucket).remove([path]),
    ));
    const cleanupFailed = cleanup.some((item) => item.error);
    if (module.table === "tournament_settings") {
      try {
        await revalidatePublicSettings();
      } catch (error) {
        console.error("[admin settings] Could not refresh public pages", error);
        cancelEdit();
        await load();
        router.refresh();
        setError("Settings were saved, but public pages could not be refreshed immediately. They may take up to 60 seconds to update.");
        setSaving(false);
        return;
      }
    }
    cancelEdit();
    setNotice(`${editingId !== null ? "Changes saved." : "Record created."}${cleanupFailed ? " The previous image could not be removed from storage." : ""}`);
    await load();
    router.refresh();
    setSaving(false);
  }

  async function remove(row: Row) {
    if (row.id == null || !window.confirm("Delete this record? This action cannot be undone.")) return;
    setError(null);
    setNotice(null);
    const { error: deleteError } = await supabase.from(module.table).delete().eq("id", row.id);
    if (deleteError) {
      setError(`Could not delete record: ${deleteError.message}`);
      return;
    }
    const objects = module.fields.flatMap((field) => {
      if (field.type !== "image" || !field.image) return [];
      const url = row[field.name];
      if (typeof url !== "string") return [];
      const path = imageObjectPath(url, field.image.bucket);
      return path ? [{ bucket: field.image.bucket, path }] : [];
    });
    const cleanup = await Promise.all(objects.map(({ bucket, path }) =>
      supabase.storage.from(bucket).remove([path]),
    ));
    const cleanupFailed = cleanup.some((item) => item.error);
    setNotice(`Record deleted.${cleanupFailed ? " Its image could not be removed from storage." : ""}`);
    await load();
    router.refresh();
  }

  function renderField(field: AdminField) {
    const common = {
      id: field.name,
      name: field.name,
      required: field.required,
      className: "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm",
    };
    const value = values[field.name] ?? "";

    if (field.type === "boolean") {
      return (
        <label key={field.name} className="flex items-center gap-2 rounded-md border p-3 text-sm">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
          />
          {field.label}
        </label>
      );
    }
    if (field.type === "textarea") {
      return (
        <label key={field.name} htmlFor={field.name} className="block text-sm font-medium">
          {field.label}
          <textarea {...common} rows={3} value={String(value)} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
        </label>
      );
    }
    if (field.type === "select") {
      const options = field.options ?? (field.lookup ? (lookups[field.lookup.table] ?? []).map((item) => ({ value: item.id, label: item.label })) : []);
      return (
        <label key={field.name} htmlFor={field.name} className="block text-sm font-medium">
          {field.label}
          <select {...common} value={String(value)} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}>
            {!field.required && <option value="">None selected</option>}
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      );
    }
    if (field.type === "image" && field.image) {
      const file = selectedFiles[field.name];
      const currentUrl = String(value);
      const preview = previewUrls[field.name] ?? (currentUrl || null);
      const inputId = `image-${field.name}`;
      return (
        <div key={field.name} className="space-y-2">
          <label htmlFor={inputId} className="block text-sm font-medium">{field.label}</label>
          {preview && (
            <Image
              src={preview}
              alt={`${field.label} preview`}
              width={160}
              height={112}
              unoptimized
              className="h-28 w-40 rounded-md border object-contain"
            />
          )}
          <input
            id={inputId}
            name={field.name}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            required={field.required && !currentUrl && !file}
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              if (!selected) {
                selectImage(field, null);
                return;
              }
              const maxBytes = field.image!.maxSizeMB * 1024 * 1024;
              if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
                setError(`${field.label}: choose a JPG, PNG or WebP image.`);
                event.target.value = "";
                selectImage(field, null);
                return;
              }
              if (selected.size > maxBytes) {
                setError(`${field.label}: the image must be ${field.image!.maxSizeMB} MB or smaller.`);
                event.target.value = "";
                selectImage(field, null);
                return;
              }
              setError(null);
              selectImage(field, selected);
            }}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-semibold"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WebP · up to {field.image.maxSizeMB} MB
            {file ? ` · ${file.name}` : currentUrl ? " · Choose a new file to replace the current image" : ""}
          </p>
          {(file || currentUrl) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                selectImage(field, null);
                setValues((current) => ({ ...current, [field.name]: "" }));
                const input = document.getElementById(inputId);
                if (input instanceof HTMLInputElement) input.value = "";
              }}
            >
              Remove image
            </Button>
          )}
        </div>
      );
    }
    return (
      <label key={field.name} htmlFor={field.name} className="block text-sm font-medium">
        {field.label}
        <input
          {...common}
          type={field.type === "datetime" ? "datetime-local" : field.type}
          value={String(value)}
          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
        />
      </label>
    );
  }

  const editing = creating || editingId !== null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">{module.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{module.description}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RotateCw className="h-4 w-4" aria-hidden /> Refresh
          </Button>
          {!module.readOnly && !module.singleton && !editing && (
            <Button type="button" size="sm" onClick={startCreate}>
              <Plus className="h-4 w-4" aria-hidden /> Add new
            </Button>
          )}
          {module.singleton && !editing && !loading && (
            <Button
              type="button"
              size="sm"
              onClick={() => rows[0] ? startEdit(rows[0]) : startCreate()}
            >
              <Pencil className="h-4 w-4" aria-hidden /> Edit settings
            </Button>
          )}
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">{notice}</p>}
      {module.table === "matches" && (
        <p className="mb-4 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
          For score changes, add or edit goal events in Stats / events. When a match has goal events, its score is recalculated from those events.
        </p>
      )}

      {editing && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">{module.fields.map(renderField)}</div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4" aria-hidden /> {saving ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4" aria-hidden /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading records...</p>
      ) : !module.singleton && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-secondary/60">
              <tr>
                {module.listColumns.map((column) => <th key={column.name} className="px-4 py-3 font-semibold">{column.label}</th>)}
                {!module.readOnly && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={String(row.id ?? row.team_id ?? index)} className="border-t">
                  {module.listColumns.map((column) => {
                    const field = module.fields.find((item) => item.name === column.name);
                    return <td key={column.name} className="max-w-xs px-4 py-3">{cellValue(row[column.name], field, lookups)}</td>;
                  })}
                  {!module.readOnly && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(row)} aria-label={`Edit ${module.title} record`}>
                        <Pencil className="h-4 w-4" aria-hidden /> Edit
                      </Button>
                      {!module.singleton && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => void remove(row)} aria-label={`Delete ${module.title} record`}>
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden /> Delete
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={module.listColumns.length + (module.readOnly ? 0 : 1)} className="px-4 py-10 text-center text-muted-foreground">
                  No records yet.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
