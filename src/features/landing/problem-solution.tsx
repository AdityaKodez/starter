import {
  IconBrain,
  IconRepeat,
  IconQuestionMark,
  IconInfinity,
  IconSitemap,
  IconNotes,
  IconTargetArrow,
  IconChartDots3,
} from "@tabler/icons-react";
import { type ComponentType } from "react";

const problems: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}[] = [
  {
    icon: IconBrain,
    text: "You watch a 4-hour playlist… and forget 80% by tomorrow.",
  },
  {
    icon: IconRepeat,
    text: "You re-watch the same parts 3 times because nothing sticks.",
  },
  {
    icon: IconQuestionMark,
    text: "There's no way to quiz yourself or review what you actually learned.",
  },
  {
    icon: IconInfinity,
    text: "The algorithm keeps recommending more videos. You never finish the course.",
  },
];

const solutions: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}[] = [
  {
    icon: IconSitemap,
    text: "Visual mind maps of every video — see the whole concept at a glance.",
  },
  {
    icon: IconNotes,
    text: "Crisp, AI-written summaries so you remember without re-watching.",
  },
  {
    icon: IconTargetArrow,
    text: "Per-video quizzes to test your understanding the moment you finish.",
  },
  {
    icon: IconChartDots3,
    text: "Flowcharts for complex topics — concepts you can actually follow.",
  },
];

const DoodleArrow = () => (
  <svg
    width="48"
    height="36"
    viewBox="0 0 48 36"
    fill="none"
    className="text-muted-foreground/50"
    aria-hidden="true"
  >
    <path
      d="M4 6 C12 2, 30 2, 40 18 C44 24, 44 28, 39 33"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      strokeDasharray="4 4"
    />
    <path
      d="M42 26 L40 32 L46 30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProblemSolution = () => {
  return (
    <section className="w-full py-12 px-4">
      {/* ── PROBLEM SIDE ────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase font-mono tracking-widest text-muted-foreground mb-1">
              Let&apos;s be honest
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
              Watching YouTube playlists{" "}
              <span className="relative inline-block">
                <span className="relative z-10">isn&apos;t learning.</span>
                <svg
                  className="absolute left-0 top-1/2 w-full"
                  style={{ transform: "translateY(-40%)" }}
                  height="10"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M0 6 Q25 2 50 6 Q75 10 100 5"
                    stroke="#ef4444"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>
          <DoodleArrow />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {problems.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-4"
            >
              <Icon className="size-8 shrink-0 text-muted-foreground mt-0.5" />
              <p className="text-sm leading-relaxed text-foreground/80 pt-1">
                {text}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground italic pl-1">
          (You&apos;ve been there. We&apos;ve all been there.)
        </p>
      </div>

      {/* ── DIVIDER with arrow ───────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-border" />
        <div className="flex flex-col items-center text-muted-foreground/60">
          <svg
            width="24"
            height="40"
            viewBox="0 0 24 40"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 2 Q14 20 12 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path
              d="M7 32 L12 38 L17 32"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-xs font-mono font-semibold tracking-widest uppercase mt-1">
            So we built this
          </p>
        </div>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── SOLUTION SIDE ───────────────────────────────── */}
      <div>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Enter Coursa
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug">
            Paste a playlist. Walk away smarter.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {solutions.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
            >
              <Icon className="size-8 shrink-0 text-emerald-600 mt-0.5" />
              <p className="text-sm leading-relaxed text-foreground/80 pt-1">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
