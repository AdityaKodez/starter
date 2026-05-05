"use client";

import { Button } from "@/components/ui/button";
import { Subject } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { IconAtom, IconFlask, IconMathIntegral } from "@tabler/icons-react";
import { useState } from "react";

const subjects: {
  value: Subject;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: Subject.maths,
    label: "Mathematics",
    description: "Calculus, Algebra, Trigonometry",
    icon: <IconMathIntegral className="size-5" />,
    color:
      "group-hover/card:text-yellow-400 data-[selected=true]:text-yellow-400",
  },
  {
    value: Subject.physics,
    label: "Physics",
    description: "Mechanics, Optics, Electromagnetism",
    icon: <IconAtom className="size-5" />,
    color: "group-hover/card:text-blue-400 data-[selected=true]:text-blue-400",
  },
  {
    value: Subject.chemistry,
    label: "Chemistry",
    description: "Organic, Inorganic, Physical",
    icon: <IconFlask className="size-5" />,
    color:
      "group-hover/card:text-emerald-400 data-[selected=true]:text-emerald-400",
  },
];

export const WeakestSubjectStep = ({
  onSubmit,
}: {
  onSubmit: (subject: Subject) => void;
}) => {
  const [selected, setSelected] = useState<Subject | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 gap-2">
        {subjects.map((subject) => {
          const isSelected = selected === subject.value;
          return (
            <button
              key={subject.value}
              type="button"
              onClick={() => setSelected(subject.value)}
              data-selected={isSelected}
              className={cn(
                "group/card flex items-center gap-4 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer",
                "hover:border-primary/40 hover:bg-primary/5",
                isSelected
                  ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                  isSelected
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground",
                  subject.color,
                )}
                data-selected={isSelected}
              >
                {subject.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-snug">
                  {subject.label}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {subject.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => selected && onSubmit(selected)}
        disabled={selected === null}
        className="w-full mt-1"
      >
        Continue
      </Button>
    </div>
  );
};
