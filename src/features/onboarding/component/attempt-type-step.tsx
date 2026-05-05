"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconRefresh, IconRocket } from "@tabler/icons-react";

const options = [
  {
    value: 1,
    label: "First Attempt",
    description: "I'm appearing for the first time",
    emoji: <IconRocket className="size-6 text-muted-foreground" />,
  },
  {
    value: 2,
    label: "Second Attempt / Dropout",
    description: "I've attempted before or took a gap",
    emoji: <IconRefresh className="size-6 text-muted-foreground" />,
  },
] as const;

export const AttemptTypeStep = ({
  onSubmit,
}: {
  onSubmit: (attemptNumber: number) => void;
}) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4  mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            className={cn(
              option.value === 1 && index === 0 ? "col-span-2" : "col-span-1",
              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer",
              "hover:border-primary/50 hover:bg-primary/5",
              selected === option.value
                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                : "border-border bg-card",
            )}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="font-medium text-sm">{option.label}</span>
            <span className="text-xs text-muted-foreground leading-snug">
              {option.description}
            </span>
          </button>
        ))}
      </div>
      <Button
        onClick={() => selected && onSubmit(selected)}
        disabled={selected === null}
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
};
