import { LoginDialog } from "@/components/login-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUnauth } from "@/utils/auth-utils";
import {
  IconArrowRight,
  IconBook2,
  IconClipboardCheck,
  IconClock12,
} from "@tabler/icons-react";

const highlights = [
  {
    title: "Plan in minutes",
    description: "Build daily study tasks and keep them balanced by subject.",
    icon: IconBook2,
  },
  {
    title: "Track your time",
    description: "See where your time goes and keep a steady streak.",
    icon: IconClock12,
  },
  {
    title: "Reflect and improve",
    description: "Capture quick reflections and improve the next plan.",
    icon: IconClipboardCheck,
  },
];

export default async function HomePage() {
await requireUnauth()

  return (
    <main className="relative min-h-screen overflow-hidden">
     
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-8 sm:py-14">
        <header className="flex items-center justify-between gap-4">
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

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
         
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Turn study goals into a calm, repeatable routine.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Aura helps you plan, track, and reflect on your study sessions so
                you always know what to do next and how you are improving.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LoginDialog>
                <Button size="lg">Get started
                      <IconArrowRight className="size-4" />
                </Button>
              </LoginDialog>
            
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Organize by subject</span>
              <span>Track minutes</span>
              <span>Daily reflection prompts</span>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="border-border/60 bg-card/70">
              <CardHeader>
                <CardTitle className="text-sm">Today&apos;s focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Planner status</span>
                  <Badge variant="secondary">Ready</Badge>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-3/5 rounded-full bg-primary/70" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep a balanced mix of study, revision, and tests.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4"
                  >
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex flex-col items-start gap-3 rounded-3xl border border-border/60 bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Ready to plan your next day?</p>
            <p className="text-xs text-muted-foreground">
              Join Aura and build your first study plan in minutes.
            </p>
          </div>
          <LoginDialog>
            <Button size="lg">Create free plan</Button>
          </LoginDialog>
        </section>
      </div>
    </main>
  );
}
