import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { ADMIN_MODULES, type AdminModuleKey } from "@/lib/admin/modules";
import { requireAdmin } from "@/lib/supabase/require-admin";

export const metadata: Metadata = { title: "Manage tournament" };

export default async function AdminModulePage({ params }: { params: { section: string } }) {
  const adminModule = ADMIN_MODULES[params.section as AdminModuleKey];
  if (!adminModule) notFound();
  await requireAdmin();

  return (
    <section className="container py-10">
      <AdminNav />
      <AdminWorkspace module={adminModule} />
    </section>
  );
}
