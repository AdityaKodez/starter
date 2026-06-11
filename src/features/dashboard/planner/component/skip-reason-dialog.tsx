"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SKIP_REASONS = [

  "No time",
  "Low energy",
  "Too hard",
  "Not interested",
] as const;

const SKIP_EMOJIS = [
  "⏰",
  "⚡",
  "😵‍💫",
  "😐",
] as const;

const SKIP_ADJUSTMENTS = [
  "We'll adjust tomorrow's plan to fit your busy day by prioritizing high-impact tasks and scheduling shorter, more focused sessions.",
  "We'll make tomorrow's plan much gentler, suggesting low-effort, low-demand activities to help you recover your energy.",
  "We'll break down complex or challenging tasks into smaller, bite-sized steps tomorrow and adjust the difficulty.",
  "We'll prune tasks from this category tomorrow and introduce other topics that better align with your current interests."
] as const;

type SkipReasonDialogProps = {
  open: boolean;
  taskTitle?: string | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSelect: (reason: string) => void;
};

export function SkipReasonDialog({
  open,
  taskTitle,
  isSaving,
  onOpenChange,
  onCancel,
  onSelect,
}: SkipReasonDialogProps) {
  const [selected, setSelected] = useState(0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Why are you skipping?</DialogTitle>
          <DialogDescription>
            Pick a quick reason so tomorrow&apos;s plan improves.
          </DialogDescription>
        </DialogHeader>
        {taskTitle && (
          <div className="text-xs font-medium text-muted-foreground">
            {taskTitle}
          </div>
        )}
        <div className="space-y-4">
          <div className="flex justify-between text-xl px-1">
            {SKIP_EMOJIS.map((e, i) => (
              <span
                key={e}
                className={`transition-all duration-300 transform ${
                  i === selected ? "scale-125 filter-none font-semibold" : "opacity-40 grayscale"
                }`}
              >
                {e}
              </span>
            ))}
          </div>
          <Slider
            min={0}
            max={SKIP_REASONS.length - 1}
            step={1}
            defaultValue={[0]}
            onValueChange={(val) => setSelected(val[0])}
            disabled={isSaving}
            className="cursor-grab"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {SKIP_REASONS.map((r, i) => (
              <span
                key={r}
                className={`transition-colors duration-300 ${
                  i === selected ? "font-semibold text-foreground" : ""
                }`}
              >
                {r}
              </span>
            ))}
          </div>

         
            <div className="flex items-center gap-1.5 font-semibold text-primary dark:text-primary-foreground mb-1">
            
              <span>Tomorrow&apos;s adjustment:</span>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              {SKIP_ADJUSTMENTS[selected]}
            </p>
          </div>
     
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => onSelect(SKIP_REASONS[selected])}
            disabled={isSaving}
          >
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
