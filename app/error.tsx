"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-24 text-center">
      <h1 className="font-display text-5xl font-extrabold">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        The page could not be loaded. Check your connection and try again.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
