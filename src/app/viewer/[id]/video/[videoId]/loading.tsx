import { Skeleton } from "@/components/ui/skeleton";

export default function VideoLoading() {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-2 sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        <div className="overflow-hidden rounded-xl border bg-card p-2">
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>

        <div className="rounded-xl border bg-card">
          <div className="space-y-3 border-b p-6">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-6 h-4 w-5/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mt-4 bg-background/90 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </>
  );
}
