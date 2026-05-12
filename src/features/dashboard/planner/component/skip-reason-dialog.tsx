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
            <div className="flex justify-between text-lg text-muted-foreground">
                {
                    SKIP_EMOJIS.map((e, i) => (
                        <span key={e} className={" " + (i === selected ? "font-medium text-foreground" : "")}>
                            {e}
                        </span>
                    ))
                }
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
              <span key={r} className={"" + (i === selected ? "font-medium text-foreground" : "")}>
                {r}
              </span>
            ))}
          </div>
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
