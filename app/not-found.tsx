import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="font-display text-8xl font-extrabold text-primary">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Offside: page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        This page does not exist, or it has not been built yet.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Back to home
      </Link>
    </div>
  );
}
