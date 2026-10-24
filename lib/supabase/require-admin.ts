import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/admin/login");
  if (data.user.app_metadata.role !== "admin") redirect("/admin/login?error=not-admin");

  return { supabase, user: data.user };
}
