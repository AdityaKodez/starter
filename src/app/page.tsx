import { LoginDialog } from "@/components/login-dialog";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUnauth } from "@/utils/auth-utils";
import {
  IconArrowRight,
  IconBook2,
  IconBrain,
  IconChartDots,
  IconClipboardCheck,
  IconClock12,
  IconHeartHandshake,
  IconMoodSmile,
  IconRepeat,
  IconRoute,
  IconScale,
  IconTargetArrow,
} from "@tabler/icons-react";

const highlights = [
  {
    title: "Plan in minutes",
    description: "Build daily study tasks from your syllabus and real progress.",
    icon: IconBook2,
  },
  {
    title: "Track your effort",
    description: "See time, status, skips, and test outcomes in one routine.",
    icon: IconClock12,
  },
  {
    title: "Reflect and improve",
    description: "Use quick feedback so tomorrow is not planned from scratch.",
    icon: IconClipboardCheck,
  },
];

const planningSteps = [
  {
    label: "Signals",
    title: "Reads your context",
    description: "Exam aim, daily minutes, syllabus topics, progress, confidence, and mistakes.",
    icon: IconChartDots,
  },
  {
    label: "Ranking",
    title: "Chooses the right candidates",
    description: "The backend ranks topics first, then sends a focused set to the planner.",
    icon: IconTargetArrow,
  },
  {
    label: "Day plan",
    title: "Arranges a useful mix",
    description: "Study, revision, and tests are placed only when there is evidence for them.",
    icon: IconRoute,
  },
];

const wellnessRules = [
  {
    title: "Load balance",
    description: "Avoids stacking more than two heavy topics back to back.",
    icon: IconScale,
  },
  {
    title: "Recovery windows",
    description: "Keeps the day steady instead of turning every weak spot into an emergency.",
    icon: IconHeartHandshake,
  },
  {
    title: "Honest revision",
    description: "Revision appears when enough time has passed or progress says it is needed.",
    icon: IconRepeat,
  },
  {
    title: "Mood-aware reflection",
    description: "Short end-of-day notes explain whether the plan actually fit the student.",
    icon: IconMoodSmile,
  },
];

export function PlannerDoodle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 320"
      className="h-auto w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="planner-hatch"
          width="10"
          height="10"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            className="stroke-foreground"
            strokeWidth="4"
          />
        </pattern>
      </defs>

      {/* Hard offset shadow */}
      <rect
        x="122"
        y="52"
        width="270"
        height="244"
        className="fill-foreground"
      />

      {/* Main planner card — sharp corners, heavy outline */}
      <rect
        x="110"
        y="40"
        width="270"
        height="244"
        className="fill-background stroke-foreground"
        strokeWidth="5"
      />

      {/* Header band — solid black with inverted label */}
      <rect x="110" y="40" width="270" height="48" className="fill-foreground" />
      <text
        x="130"
        y="72"
        className="fill-background font-mono"
        fontSize="22"
        fontWeight="800"
        letterSpacing="4"
      >
        TODAY
      </text>
      {/* Header tick squares */}
      <rect x="330" y="54" width="10" height="10" className="fill-background" />
      <rect x="346" y="54" width="10" height="10" className="fill-background/40" />
      <rect x="330" y="70" width="10" height="10" className="fill-background/40" />
      <rect x="346" y="70" width="10" height="10" className="fill-background" />

      {/* Task 1 — done: solid box with bold check */}
      <rect x="134" y="108" width="26" height="26" className="fill-foreground" />
      <path
        d="M140 121 l6 6 l11 -13"
        className="stroke-background"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <rect x="176" y="114" width="150" height="13" className="fill-foreground" />

      {/* Task 2 — done: solid box with bold check */}
      <rect x="134" y="152" width="26" height="26" className="fill-foreground" />
      <path
        d="M140 165 l6 6 l11 -13"
        className="stroke-background"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <rect x="176" y="158" width="118" height="13" className="fill-foreground/35" />

      {/* Task 3 — current: outlined box, hatched bar */}
      <rect
        x="134"
        y="196"
        width="26"
        height="26"
        className="stroke-foreground fill-transparent"
        strokeWidth="4"
      />
      <rect
        x="176"
        y="202"
        width="170"
        height="13"
        fill="url(#planner-hatch)"
        className="stroke-foreground"
        strokeWidth="2.5"
      />

      {/* Progress bar — 2 of 3 filled */}
      <rect
        x="134"
        y="244"
        width="190"
        height="18"
        className="stroke-foreground fill-transparent"
        strokeWidth="4"
      />
      <rect x="134" y="244" width="127" height="18" className="fill-foreground" />
      <text
        x="336"
        y="259"
        className="fill-foreground font-mono"
        fontSize="15"
        fontWeight="800"
      >
        2/3
      </text>

      {/* Offset tag — intentionally tilted */}
      <g transform="rotate(-7 70 96)">
        <rect
          x="22"
          y="78"
          width="96"
          height="36"
          className="fill-background stroke-foreground"
          strokeWidth="4"
        />
        <text
          x="36"
          y="102"
          className="fill-foreground font-mono"
          fontSize="15"
          fontWeight="800"
          letterSpacing="2"
        >
          PLAN 01
        </text>
      </g>

      {/* Bold geometric arrow pointing at current task */}
      <g transform="rotate(4 60 209)">
        <rect x="20" y="202" width="58" height="13" className="fill-foreground" />
        <path d="M78 192 L102 208.5 L78 225 Z" className="fill-foreground" />
      </g>

      {/* Corner accents — utilitarian crop marks */}
      <path d="M404 56 h24 M416 44 v24" className="stroke-foreground" strokeWidth="4" />
      <rect x="412" y="262" width="16" height="16" className="fill-foreground" />
      <rect
        x="438"
        y="250"
        width="16"
        height="16"
        className="stroke-foreground fill-transparent"
        strokeWidth="4"
      />
    </svg>
  );
}

export function WellnessDoodle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 320"
      className="h-auto w-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="wellness-hatch"
          width="10"
          height="10"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            className="stroke-foreground"
            strokeWidth="4"
          />
        </pattern>
      </defs>

      {/* ===== Left panel: LOAD gauge ===== */}
      {/* Hard offset shadow */}
      <rect x="52" y="62" width="190" height="216" className="fill-foreground" />
      <rect
        x="40"
        y="50"
        width="190"
        height="216"
        className="fill-background stroke-foreground"
        strokeWidth="5"
      />
      {/* Header band */}
      <rect x="40" y="50" width="190" height="42" className="fill-foreground" />
      <text
        x="56"
        y="78"
        className="fill-background font-mono"
        fontSize="18"
        fontWeight="800"
        letterSpacing="4"
      >
        LOAD
      </text>
      <rect x="196" y="62" width="10" height="10" className="fill-background" />
      <rect x="210" y="62" width="10" height="10" className="fill-background/40" />

      {/* Vertical load bars — heavy / medium / light */}
      <rect x="62" y="124" width="34" height="110" className="fill-foreground" />
      <rect
        x="110"
        y="156"
        width="34"
        height="78"
        fill="url(#wellness-hatch)"
        className="stroke-foreground"
        strokeWidth="3"
      />
      <rect
        x="158"
        y="186"
        width="34"
        height="48"
        className="stroke-foreground fill-transparent"
        strokeWidth="4"
      />
      {/* Baseline */}
      <line x1="56" y1="234" x2="214" y2="234" className="stroke-foreground" strokeWidth="5" />
      {/* Limit marker */}
      <line
        x1="56"
        y1="124"
        x2="214"
        y2="124"
        className="stroke-foreground"
        strokeWidth="3"
        strokeDasharray="8 6"
      />
      <text
        x="62"
        y="256"
        className="fill-foreground font-mono"
        fontSize="13"
        fontWeight="800"
        letterSpacing="2"
      >
        MAX 2 HEAVY
      </text>

      {/* ===== Right panel: STEADY pulse ===== */}
      <rect x="272" y="92" width="196" height="142" className="fill-foreground" />
      <rect
        x="260"
        y="80"
        width="196"
        height="142"
        className="fill-background stroke-foreground"
        strokeWidth="5"
      />
      {/* Blocky step pulse — steady, not spiky */}
      <path
        d="M276 168 h28 v-36 h28 v36 h30 v-52 h28 v52 h28 v-24 h22"
        className="stroke-foreground fill-transparent"
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Recovery window — hatched block under the line */}
      <rect
        x="362"
        y="184"
        width="64"
        height="22"
        fill="url(#wellness-hatch)"
        className="stroke-foreground"
        strokeWidth="3"
      />
      <text
        x="276"
        y="206"
        className="fill-foreground font-mono"
        fontSize="13"
        fontWeight="800"
        letterSpacing="2"
      >
        REST
      </text>

      {/* Offset tag — intentionally tilted */}
      <g transform="rotate(6 380 64)">
        <rect
          x="330"
          y="42"
          width="118"
          height="36"
          className="fill-background stroke-foreground"
          strokeWidth="4"
        />
        <text
          x="344"
          y="66"
          className="fill-foreground font-mono"
          fontSize="15"
          fontWeight="800"
          letterSpacing="2"
        >
          STEADY
        </text>
      </g>

      {/* Bold geometric arrow linking load to pulse */}
      <g transform="rotate(-3 245 160)">
        <rect x="226" y="152" width="34" height="12" className="fill-foreground" />
        <path d="M260 142 L282 158 L260 174 Z" className="fill-foreground" />
      </g>

      {/* Corner accents — utilitarian crop marks */}
      <path d="M276 252 h24 M288 240 v24" className="stroke-foreground" strokeWidth="4" />
      <rect x="430" y="246" width="16" height="16" className="fill-foreground" />
      <rect
        x="454"
        y="234"
        width="16"
        height="16"
        className="stroke-foreground fill-transparent"
        strokeWidth="4"
      />
    </svg>
  );
}

export default async function HomePage() {
  await requireUnauth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-dashed border-foreground/20 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-12">
          <div className="flex items-center gap-3">
            <Logo size={36} className="text-foreground" />
            <div>
              <p className="text-sm font-semibold">Aura</p>
              <p className="text-xs text-muted-foreground">
                Study planning, simplified
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LoginDialog>
              <Button variant="default">Sign in</Button>
            </LoginDialog>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-8 sm:py-14 border-x border-dashed border-foreground/20">

        <section className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center px-6 sm:px-12">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Planner plus wellness, not pressure
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Turn study goals into a calm, repeatable routine.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Aura builds a focused daily plan from your exam goal, syllabus,
                progress, mistakes, and energy. It helps you study with
                direction without letting the planner become another source of
                burnout.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LoginDialog>
                <Button size="lg">
                  Get started
                  <IconArrowRight className="size-4" />
                </Button>
              </LoginDialog>
              
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Backend-ranked topics</span>
              <span>Study, revision, and tests</span>
              <span>Cognitive load checks</span>
            </div>
          </div>

          <div className="relative">
          
            <Card className="relative ring-0">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm">Today&apos;s focus</CardTitle>
                  <Badge variant="secondary">Ready</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 flex">
                <PlannerDoodle />
                <div className="flex flex-col gap-3 text-center font-mono text-xs">
                  <div className="border-2 border-foreground bg-foreground p-3 text-background shadow-[4px_4px_0_0_var(--muted-foreground)]">
                    <p className="font-bold uppercase tracking-widest">Study</p>
                    <p className="text-background/70">45 MIN</p>
                  </div>
                  <div className="border-2 border-foreground bg-background p-3 shadow-[4px_4px_0_0_var(--foreground)]">
                    <p className="font-bold uppercase tracking-widest">
                      Revision
                    </p>
                    <p className="text-muted-foreground">25 MIN</p>
                  </div>
                  <div className="border-2 border-dashed border-foreground bg-background p-3 shadow-[4px_4px_0_0_var(--foreground)]">
                    <p className="font-bold uppercase tracking-widest">Test</p>
                    <p className="text-muted-foreground">20 MIN</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <hr className="border-t border-dashed border-foreground/20 w-full" />

        <section className="grid gap-3 sm:grid-cols-3 px-6 sm:px-12">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-none border border-border/60 bg-card/70 p-5 backdrop-blur"
              >
                <div className="mb-5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>

        <hr className="border-t border-dashed border-foreground/20 w-full" />

        <section id="how-it-works" className="space-y-7 px-6 sm:px-12">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="rounded-full">
              How Aura decides today
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              The model does not randomly pick what looks balanced.
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Aura keeps the important planning rules in code first. The AI
              receives a smaller ranked set and focuses on presenting a useful
              day, not inventing priority from the whole syllabus.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {planningSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-none border border-border/60 bg-card/75 p-5"
                >
                  {index < planningSteps.length - 1 ? (
                    <div className="absolute -right-5 top-12 hidden h-px w-6 bg-border lg:block" />
                  ) : null}
                  <div className="mb-8 flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-full">
                      {step.label}
                    </Badge>
                    <Icon className="size-5 text-primary" />
                  </div>
                  <p className="text-base font-medium">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="border-t border-dashed border-foreground/20 w-full" />

        <div className="px-6 sm:px-12">
          <section className="grid gap-8 rounded-none border border-border/60 bg-card/70 p-5 backdrop-blur sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="rounded-full">
                Wellness built into planning
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Useful plans respect energy, not just ambition.
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                The wellness layer is practical: it watches cognitive load,
                revision timing, and reflection signals so the day feels doable.
                No mood theater, no fake productivity score.
              </p>
              <WellnessDoodle />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {wellnessRules.map((rule) => {
                const Icon = rule.icon;
                return (
                  <div
                    key={rule.title}
                    className="rounded-none border border-border/60 bg-background/70 p-5"
                  >
                    <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <Icon className="size-5" />
                    </div>
                    <p className="text-sm font-medium">{rule.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <hr className="border-t border-dashed border-foreground/20 w-full" />

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start px-6 sm:px-12">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full">
              Feedback loop
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tomorrow gets better because today leaves evidence.
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Completed tasks, skipped tasks, test results, and reflections are
              the signals that make the next plan less generic.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Finish", "Mark what actually got done."],
              ["Explain", "Capture skips, struggle, or low energy."],
              ["Adjust", "Use that evidence in the next plan."],
            ].map(([title, description], index) => (
              <div
                key={title}
                className="rounded-none border border-border/60 bg-card/70 p-5"
              >
                <div className="mb-5 flex size-9 items-center justify-center rounded-full border border-foreground/15 text-sm font-semibold">
                  {index + 1}
                </div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-t border-dashed border-foreground/20 w-full" />

        <div className="px-6 sm:px-12">
          <section className="flex flex-col items-start gap-5 rounded-none border border-border/60 bg-foreground p-6 text-background sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <IconBrain className="size-5" />
                Start with one realistic day
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                Build the first plan, then let real feedback shape the next one.
              </p>
            </div>
            <LoginDialog>
              <Button size="lg" variant="secondary">
                Create free plan
                <IconArrowRight className="size-4" />
              </Button>
            </LoginDialog>
          </section>
        </div>
      </div>
    </main>
  );
}
