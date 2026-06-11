import OnboardingChat from "@/features/onboarding/onboarding";
import { requireAuth } from "@/utils/auth-utils";
import { getServerCaller } from "@/utils/caller";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
function OnboardingSkeleton() {
  return (
    <div className="w-full pt-8 md:pt-18 px-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-8">
        {/* Assistant avatar + message skeleton */}
        <div className="flex flex-col gap-2 max-w-[95%]">
          <div className="size-7.5 rounded-full bg-muted/40 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-70 rounded-md bg-muted/30 animate-pulse" />
            <div className="h-4 w-55 rounded-md bg-muted/30 animate-pulse delay-75" />
          </div>
        </div>

        {/* Input component skeleton */}
        <div className="flex flex-col gap-4 max-w-[95%] pl-0">
          <div className="h-9 w-full rounded-full bg-muted/20 animate-pulse delay-100" />
          <div className="h-9 w-full rounded-full bg-muted/20 animate-pulse delay-150" />
        </div>
      </div>
    </div>
  );
}

function OnboardingError() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-destructive text-lg">!</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="text-xs text-muted-foreground">
          Please refresh the page to try again.
        </p>
      </div>
    </div>
  );
}

export default async function OnboardingPage() {
  await requireAuth();
  const caller = await getServerCaller();
  const data = await caller.onboarding.isCompleted();

  if (data.data) {
    redirect("/dashboard");
  }
  return (
    <div className="flex justify-center min-h-screen bg-background">
      <div className="flex flex-col h-screen w-full max-w-4xl border-x border-dashed border-foreground/20 no-scrollbar">
        <Suspense fallback={<OnboardingSkeleton />}>
          <ErrorBoundary fallback={<OnboardingError />}>
            <OnboardingChat />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
}
