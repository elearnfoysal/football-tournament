import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-28 w-full max-w-xl" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
      <div className="container grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
