import { LoginDialog } from "@/components/login-dialog";
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
    
      
      {/* Main Planner Card */}
      <rect
        x="130"
        y="40"
        width="240"
        height="240"
        rx="24"
        className="fill-background stroke-border"
        strokeWidth="4"
      />
      
      {/* Header Bar */}
      <line
        x1="170"
        y1="80"
        x2="270"
        y2="80"
        className="stroke-foreground/80"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Task 1 - Checked */}
      <rect x="170" y="120" width="24" height="24" rx="6" className="fill-emerald-500" />
      <path
        d="M177 132 l5 5 l8 -10"
        className="stroke-background"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="210"
        y1="132"
        x2="330"
        y2="132"
        className="stroke-foreground/40"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Task 2 - Unchecked */}
      <rect
        x="170"
        y="166"
        width="24"
        height="24"
        rx="6"
        className="stroke-foreground/30 fill-transparent"
        strokeWidth="3"
      />
      <line
        x1="210"
        y1="178"
        x2="300"
        y2="178"
        className="stroke-foreground/40"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Task 3 - Unchecked */}
      <rect
        x="170"
        y="212"
        width="24"
        height="24"
        rx="6"
        className="stroke-foreground/30 fill-transparent"
        strokeWidth="3"
      />
      <line
        x1="210"
        y1="224"
        x2="280"
        y2="224"
        className="stroke-foreground/40"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Accent Arrow */}
      <path
        d="M80 150 C 100 110, 140 120, 155 125"
        className="stroke-amber-500 fill-transparent"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M145 115 L 160 127 L 145 140"
        className="stroke-amber-500 fill-transparent"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      {/* Background Soft Plate */}
      <rect
        x="60"
        y="60"
        width="400"
        height="200"
        rx="40"
        className="fill-rose-500/5"
      />

      {/* Activity Ring Backgrounds */}
      <circle
        cx="160"
        cy="160"
        r="54"
        className="stroke-foreground/10 fill-transparent"
        strokeWidth="14"
      />
      <circle
        cx="160"
        cy="160"
        r="34"
        className="stroke-foreground/10 fill-transparent"
        strokeWidth="14"
      />

      {/* Activity Ring Foregrounds */}
      <path
        d="M160 106 A 54 54 0 1 1 106 160"
        className="stroke-rose-500 fill-transparent"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M160 126 A 34 34 0 0 1 194 160"
        className="stroke-amber-500 fill-transparent"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* ECG / Health Stat Line */}
      <path
        d="M 270 160 L 300 160 L 320 110 L 350 220 L 370 160 L 420 160"
        className="stroke-emerald-500 fill-transparent"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Floating Stat Card */}
      <rect
        x="320"
        y="60"
        width="90"
        height="36"
        rx="18"
        className="fill-background stroke-border"
        strokeWidth="3"
      />
      <circle cx="344" cy="78" r="6" className="fill-emerald-500" />
      <line
        x1="360"
        y1="78"
        x2="390"
        y2="78"
        className="stroke-foreground/60"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function HomePage() {
  await requireUnauth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-4 sm:py-14 border-x border-dashed border-foreground/20">
        <header className="flex items-center justify-between gap-4 px-6 sm:px-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
              A
            </div>
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
        </header>

        <hr className="border-t border-dashed border-foreground/20 w-full" />

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
                <div className="flex flex-col gap-2 text-center text-xs">
                  <div className="rounded-2xl border border-border/60 bg-sky-500/10 p-3">
                    <p className="font-medium">Study</p>
                    <p className="text-muted-foreground">45 min</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-emerald-500/10 p-3">
                    <p className="font-medium">Revision</p>
                    <p className="text-muted-foreground">25 min</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-amber-500/10 p-3">
                    <p className="font-medium">Test</p>
                    <p className="text-muted-foreground">20 min</p>
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
                className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur"
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
                  className="relative rounded-3xl border border-border/60 bg-card/75 p-5"
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
          <section className="grid gap-8 rounded-[2rem] border border-border/60 bg-card/70 p-5 backdrop-blur sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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
                    className="rounded-3xl border border-border/60 bg-background/70 p-5"
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
                className="rounded-3xl border border-border/60 bg-card/70 p-5"
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
          <section className="flex flex-col items-start gap-5 rounded-[2rem] border border-border/60 bg-foreground p-6 text-background sm:flex-row sm:items-center sm:justify-between">
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
