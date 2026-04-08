import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconLink,
  IconBrain,
  IconSparkles,
  IconSchool,
} from "@tabler/icons-react";

const steps = [
  {
    step: "01",
    icon: IconLink,
    title: "Paste a Playlist URL",
    description:
      "Drop any YouTube playlist link into Coursa. We'll fetch every video in the list and get to work immediately — no login to YouTube required.",
  },
  {
    step: "02",
    icon: IconBrain,
    title: "We Extract Transcripts",
    description:
      "Coursa pulls the full transcript from every video in the playlist, chunking and cleaning the raw text so the AI has the best possible context.",
  },
  {
    step: "03",
    icon: IconSparkles,
    title: "AI Structures Your Course",
    description:
      "Gemini analyzes each transcript and outputs a rich summary, an interactive mind map, a concept flowchart, and a quiz — all formatted and ready to use.",
  },
  {
    step: "04",
    icon: IconSchool,
    title: "Learn Interactively",
    description:
      "Navigate your course lesson by lesson. Flip through summaries, explore mind maps, test yourself with quizzes, and actually retain what you watched.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="w-full py-12 md:py-18 px-4">
      <div className="mb-10 flex flex-col gap-2">
        <p className="text-sm font-semibold text-muted-foreground font-mono uppercase tracking-widest">
          How it works
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          From playlist to course in four steps.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map(({ step, icon: Icon, title, description }) => (
          <Card key={step} className="relative overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <span className="text-5xl font-black text-foreground/5 select-none leading-none">
                  {step}
                </span>
              </div>
              <CardTitle className="mt-3 text-base font-semibold">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
