import { EmptyState } from "@/components/empty-state";
import { Hero } from "@/features/landing/hero";
import { Navbar } from "@/features/landing/navbar";
import { auth } from "@/lib/auth";
import { prefetchPlaylistList } from "@/utils/prefetch";
import { headers } from "next/headers";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
 if (session) {
  await prefetchPlaylistList().catch(() => undefined);
 }
  return (
    <main className="flex flex-col flex-1 items-start sm:items-center font-sans size-full sm:px-14">
      <div className="w-full h-full">
        <Navbar />  
        <Hero />
      <div className="px-4 pb-12">
      {
        session && (
         <Suspense fallback="Loading...">
          <ErrorBoundary fallback={<EmptyState title="Failed to load playlists" description="Please try again later." />}>
     
          </ErrorBoundary>
        </Suspense>
        )
      }
      </div>
      </div>
    </main>
  );
}
