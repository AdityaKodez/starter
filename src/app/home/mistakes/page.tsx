import { EntityHeader } from "@/components/entity-state";
import { MistakeViewerSkeleton } from "@/features/mistake/mistake-skeleton";
import { MistakeViewer } from "@/features/mistake/mistake-viewer";
import { getHomeNavItem } from "@/lib/home-navigation";
import { HydrateClient } from "@/trpc/server";
import { prefetchMistakes } from "@/utils/prefetch";
import { Suspense } from "react";

export default async function MistakesPage() {
  await prefetchMistakes();

  const page = getHomeNavItem("/home/mistakes");

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <EntityHeader title={page.label} description={page.description} />
      <HydrateClient>
        <div className="py-6">
          <Suspense fallback={<MistakeViewerSkeleton />}>
            <MistakeViewer />
          </Suspense>
        </div>
      </HydrateClient>
    </section>
  );
}
