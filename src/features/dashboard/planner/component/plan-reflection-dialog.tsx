"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

type TaskFeelingOption = "too_easy" | "right_level" | "too_hard";

type MoodOption = "low" | "okay" | "good";

type PlanReflectionDialogProps = {
  open: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSubmit: (values: { taskFeeling: TaskFeelingOption; mood: MoodOption }) => void;
};

const TASK_FEELING_OPTIONS: {
  value: TaskFeelingOption;
  label: string;
  emoji: string;
}[] = [
  { value: "too_easy", label: "Too easy", emoji: "😌" },
  { value: "right_level", label: "Right level", emoji: "🙂" },
  { value: "too_hard", label: "Too hard", emoji: "😵‍💫" },
];

const MOOD_OPTIONS: { value: MoodOption; label: string; emoji: string }[] = [
  { value: "low", label: "Low", emoji: "🌧️" },
  { value: "okay", label: "Okay", emoji: "🌤️" },
  { value: "good", label: "Good", emoji: "🌼" },
];

export function PlanReflectionDialog({
  open,
  isSaving,
  onOpenChange,
  onCancel,
  onSubmit,
}: PlanReflectionDialogProps) {
  const [taskFeeling, setTaskFeeling] = useState<TaskFeelingOption | null>(null);
  const [mood, setMood] = useState<MoodOption | null>(null);


  const canSubmit = useMemo(
    () => Boolean(taskFeeling) && Boolean(mood),
    [taskFeeling, mood],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick reflection</DialogTitle>
          <DialogDescription>
            Two quick taps help improve tomorrow&apos;s plan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              How did the tasks feel?
            </p>
            <div className="flex flex-wrap gap-2">
              {TASK_FEELING_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={taskFeeling === option.value ? "default" : "outline"}
                  className={cn(
                    "h-8 gap-2",
                    taskFeeling === option.value && "pointer-events-none",
                  )}
                  onClick={() => setTaskFeeling(option.value)}
                >
                  <span aria-hidden="true">{option.emoji}</span>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              How are you feeling right now?
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={mood === option.value ? "default" : "outline"}
                  className={cn(
                    "h-8 gap-2",
                    mood === option.value && "pointer-events-none",
                  )}
                  onClick={() => setMood(option.value)}
                >
                  <span aria-hidden="true">{option.emoji}</span>
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onCancel}>
            Later
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || isSaving}
            onClick={() =>
              onSubmit({
                taskFeeling: taskFeeling ?? "right_level",
                mood: mood ?? "okay",
              })
            }
          >
            Save reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
