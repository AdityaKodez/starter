import { EmptyState, EntityHeader } from "@/components/entity-component";
import { DashboardContent } from "@/features/dashboard/dashboard";
import { DashboardContentSkeleton } from "@/features/dashboard/planner/component/dashboard-skeleton";
import { auth } from "@/lib/auth";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/utils/auth-utils";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { prefetchPlanner } from "@/lib/prefetch";
import { AlertTriangleIcon } from "lucide-react";
export default  async function DashboardPage() {
  await requireAuth();
  const user = await auth.api.getSession({
    headers : await headers(),
  });
  void prefetchPlanner();
    return (
        <div className="flex flex-col items-start justify-center p-4 no-scrollbar max-w-4xl w-full mx-auto py-4  gap-8 sm:py-8">
          <EntityHeader
           title={`Welcome back, ${user?.user?.name?.toLowerCase()}`}
           
           description="This is where you can see your study plans, track your progress, and access your resources."
          />
          <HydrateClient>
            {/* Dashboard content goes here */}
            <Suspense fallback={<DashboardContentSkeleton />}>
              <ErrorBoundary fallback={<EmptyState icon={AlertTriangleIcon} title="Error" description="Failed to load dashboard content." bordered />}>
            <DashboardContent/>
            </ErrorBoundary>
            </Suspense>
          </HydrateClient>
        </div>
    )
}