import { EntityHeader } from "@/components/entity-state";
import { TestAttemptViewer } from "@/features/test-attempt/test-attempt-viewer";
import { TestAttemptViewerSkeleton } from "@/features/test-attempt/test-attempt-skeleton";
import { FileUpload } from "@/features/upload/file-upload";
import { getHomeNavItem } from "@/lib/home-navigation";
import { HydrateClient } from "@/trpc/server";
import { requireAuth } from "@/utils/auth-utils";
import { prefetchTestAttempts } from "@/utils/prefetch";
import { Suspense } from "react";

export default async function Home() {
  await prefetchTestAttempts();

  const session = await requireAuth();
  const page = getHomeNavItem("/home");
  const userName = session?.user?.name || "User";
  const dashboardTitle = `Hey, ${userName.toLowerCase()}! 👋`;

  return (
    <section className="px-4 sm:px-6 lg:px-8">
    <EntityHeader
      title={dashboardTitle}
      description={page.description}
    />
      <HydrateClient>
        <div className="grid grid-cols-1 md:grid-cols-3 w-full py-6 md:gap-x-4 gap-y-4 items-start">
          <FileUpload />
          <Suspense fallback={<TestAttemptViewerSkeleton />}>
            <TestAttemptViewer />
          </Suspense>
        </div>
      </HydrateClient>
    </section>
  
  );
}

