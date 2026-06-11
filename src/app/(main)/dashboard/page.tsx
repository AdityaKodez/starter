import { EntityHeader } from "@/components/entity-component";
import { DashboardContent } from "@/features/dashboard/dashboard";
import { DashboardContentSkeleton } from "@/features/dashboard/planner/component/dashboard-skeleton";
import { UserProfileMenu } from "@/features/dashboard/user-profile-menu";
import { auth } from "@/lib/auth";
import { prefetchPlanner, prefetchStudyStats } from "@/lib/prefetch";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/utils/auth-utils";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your study plans, track progress, and access resources on your personalized dashboard.",
};

export default  async function DashboardPage() {
  await requireAuth();
  const user = await auth.api.getSession({
    headers : await headers(),
  });
  void prefetchPlanner();
  void prefetchStudyStats();
    return (
        <div className="flex flex-col items-start justify-center px-2 no-scrollbar max-w-7xl w-full mx-auto py-4  gap-8 sm:py-8">
          <EntityHeader
            title={`Welcome back, ${user?.user?.name?.toLowerCase()}`}
            description="This is where you can see your study plans, track your progress, and access your resources."
            action={
              <UserProfileMenu
                name={user?.user?.name}
                email={user?.user?.email}
                image={user?.user?.image}
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
