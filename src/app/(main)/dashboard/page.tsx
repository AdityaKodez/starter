import { EntityHeader } from "@/components/entity-component";
import { DashboardContent } from "@/features/dashboard/dashboard";
import { auth } from "@/lib/auth";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/utils/auth-utils";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default  async function DashboardPage() {
    await requireAuth();
  const user = await auth.api.getSession({
    headers : await headers(),
  });
    return (
        <div className="flex flex-col items-start justify-center p-4 no-scrollbar max-w-4xl w-full mx-auto py-4  gap-8 sm:py-8">
          <EntityHeader
           title={`Welcome back, ${user?.user?.name?.toLowerCase()}`}
           
           description="This is where you can see your study plans, track your progress, and access your resources."
          />
          <HydrateClient>
            {/* Dashboard content goes here */}
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorBoundary fallback={<div>Error loading dashboard</div>}>
            <DashboardContent/>
            </ErrorBoundary>
            </Suspense>
          </HydrateClient>
        </div>
    )
}