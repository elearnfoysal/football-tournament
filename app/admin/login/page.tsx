import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = { title: "Admin sign in" };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const message =
    searchParams.error === "not-admin"
      ? "This account does not have tournament administrator access."
      : searchParams.error === "configuration"
        ? "Supabase environment settings are missing. Configure the app before signing in."
        : null;

  return (
    <section className="container flex min-h-[65vh] items-center justify-center py-12">
      <AdminLoginForm initialError={message} />
    </section>
  );
}
