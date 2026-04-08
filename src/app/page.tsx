import { Hero } from "@/features/landing/hero";
import { HowItWorks } from "@/features/landing/how-it-works";
import { ProblemSolution } from "@/features/landing/problem-solution";
import { Navbar } from "@/features/landing/navbar";
import { requireAuth } from "@/utils/auth-utils";

export default async function Home() {
  await requireAuth();
  return (
    <main className="flex flex-col flex-1 items-center font-sans size-full">
      <div className="w-full h-full max-w-4xl">
        <Navbar />
        <Hero />
        <ProblemSolution />
        <HowItWorks />
      </div>
    </main>
  );
}
