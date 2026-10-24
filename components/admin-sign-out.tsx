"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function AdminSignOut() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signOut() {
    setErrorMessage(null);
    const { error } = await createClient().auth.signOut();
    if (error) {
      console.error("[admin:sign-out]", error.message);
      setErrorMessage("Could not sign out. Please try again.");
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="text-right">
      <Button type="button" variant="outline" onClick={signOut}>
        Sign out
      </Button>
      {errorMessage && <p role="alert" className="mt-2 text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
}
