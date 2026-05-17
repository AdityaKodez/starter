import { EntityHeader } from "@/components/entity-component";
import { DashboardContent } from "@/features/dashboard/dashboard";
import { DashboardContentSkeleton } from "@/features/dashboard/planner/component/dashboard-skeleton";
import { UserProfileMenu } from "@/features/dashboard/user-profile-menu";
import { prefetchPlanner, prefetchStudyStats } from "@/lib/prefetch";
import { HydrateClient } from "@/trpc/server";
import { requireOnboarding } from "@/utils/auth-utils";
import { Suspense } from "react";
export default  async function DashboardPage() {
 const user =  await requireOnboarding();
 
  void prefetchPlanner();
  void prefetchStudyStats();
    return (
        <div className="flex flex-col items-start justify-center px-2 no-scrollbar max-w-7xl w-full mx-auto py-4  gap-4 sm:py-8">
          <EntityHeader
            title={`Welcome back, ${user.name?.toLowerCase()}`}
            description="This is where you can see your study plans, track your progress, and access your resources."
            action={
              <UserProfileMenu
                name={user.name.toLowerCase()}
                email={user.email}
                image={user.image}
              />
            }
          />
          <HydrateClient>
            {/* Dashboard content goes here */}
            <Suspense fallback={<DashboardContentSkeleton />}>
       
            <DashboardContent/>
      
            </Suspense>
          </HydrateClient>
        </div>
    )
}