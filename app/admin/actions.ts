"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function revalidatePublicSettings() {
  await requireAdmin();
  revalidatePath("/", "layout");
}
