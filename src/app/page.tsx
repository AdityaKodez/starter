import { Hero } from "@/features/landing/hero";
import { Navbar } from "@/features/landing/navbar";
import { ProblemSolution } from "@/features/landing/problem-solution";

export default async function Home() {
  return (
    <main className="flex flex-col flex-1 items-center font-sans size-full">
      <div className="w-full h-full max-w-5xl">
        <Navbar />
        <Hero />
        <ProblemSolution />
        {/* <HowItWorks /> */}
      </div>
    </main>
  );
}
