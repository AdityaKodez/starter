import { EmptyState } from "@/components/empty-state";
import { Hero } from "@/features/landing/hero";
import { Navbar } from "@/features/landing/navbar";
import { ProblemSolution } from "@/features/landing/problem-solution";
import { PlaylistViewer } from "@/features/playlist/playlist-viewer";
import { prefetchPlaylistList } from "@/utils/prefetch";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { ErrorBoundary } from "react-error-boundary"; 
import { headers } from "next/headers";
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
 if (session) {
  await prefetchPlaylistList().catch(() => undefined);
 }
  return (
    <main className="flex flex-col flex-1 items-center font-sans size-full">
      <div className="w-full h-full max-w-5xl">
        <Navbar />
        <Hero />
      <div className="px-4">

      {
        session && (
         <Suspense fallback="Loading...">
          <ErrorBoundary fallback={<EmptyState title="Failed to load playlists" description="Please try again later." />}>
            <PlaylistViewer />
          </ErrorBoundary>
        </Suspense>
        )
      }
      </div>
    
        <ProblemSolution />
        {/* <HowItWorks /> */}
      </div>
    </main>
  );
}
