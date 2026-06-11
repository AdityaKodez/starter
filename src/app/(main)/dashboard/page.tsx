import { DashboardContent } from "@/features/dashboard/dashboard";
import { DashboardContentSkeleton } from "@/features/dashboard/planner/component/dashboard-skeleton";
import { prefetchPlanner, prefetchStudyStats } from "@/lib/prefetch";
import { HydrateClient } from "@/trpc/server";
import { requireOnboarding } from "@/utils/auth-utils";
import { Suspense } from "react";
export default async function DashboardPage() {
 await requireOnboarding();

  void prefetchPlanner();
  void prefetchStudyStats();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-center gap-4 px-4 py-4 sm:py-8">
 
      <HydrateClient>
        <Suspense fallback={<DashboardContentSkeleton />}>
          <DashboardContent />
        </Suspense>
      </HydrateClient>
    </div>
  );
}
