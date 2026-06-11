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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  IconCloudRain,
  IconPlayerPlayFilled,
  IconVolumeOff,
  IconWaveSine,
  IconRipple,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { AmbientSound } from "../lib/ambient-audio";
import {
  readLastSettings,
  type PomodoroSettings,
} from "../hooks/use-pomodoro";

const WORK_PRESETS = [15, 25, 45, 60] as const;

const SOUND_OPTIONS: { value: AmbientSound; label: string; icon: typeof IconRipple }[] = [
  { value: "none", label: "Silent", icon: IconVolumeOff },
  { value: "ocean", label: "Ocean waves", icon: IconRipple },
  { value: "rain", label: "Rain", icon: IconCloudRain },
  { value: "white", label: "White noise", icon: IconWaveSine },
];

type PomodoroDialogProps = {
  open: boolean;
  taskTitle?: string | null;
  taskDurationMinutes?: number | null;
  onOpenChange: (open: boolean) => void;
  onStart: (settings: PomodoroSettings) => void;
};

export function PomodoroDialog({
  open,
  taskTitle,
  taskDurationMinutes,
  onOpenChange,
  onStart,
}: PomodoroDialogProps) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [sound, setSound] = useState<AmbientSound>("none");

  // Seed from last-used settings (or the task's planned duration) on open.
  useEffect(() => {
    if (!open) return;
    const last = readLastSettings();
    setWorkMinutes(taskDurationMinutes ?? last.workMinutes);
    setBreakMinutes(last.breakMinutes);
    setSound(last.sound);
  }, [open, taskDurationMinutes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start focus session</DialogTitle>
          <DialogDescription>
            Set your work and break intervals, pick a background sound, and
            start focusing.
          </DialogDescription>
        </DialogHeader>
        {taskTitle && (
          <div className="text-xs font-medium text-muted-foreground">
            {taskTitle}
          </div>
        )}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Work duration</Label>
              <span className="text-sm font-semibold tabular-nums">
                {workMinutes} min
              </span>
            </div>
            <div className="flex gap-2">
              {WORK_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={workMinutes === preset ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setWorkMinutes(preset)}
                >
                  {preset}m
                </Button>
              ))}
            </div>
            <Slider
              min={5}
              max={120}
              step={5}
              value={[workMinutes]}
              onValueChange={(val) => setWorkMinutes(val[0])}
              aria-label="Work duration in minutes"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Break duration</Label>
              <span className="text-sm font-semibold tabular-nums">
                {breakMinutes} min
              </span>
            </div>
            <Slider
              min={1}
              max={30}
              step={1}
              value={[breakMinutes]}
              onValueChange={(val) => setBreakMinutes(val[0])}
              aria-label="Break duration in minutes"
            />
          </div>

          <div className="space-y-3">
            <Label>Background sound</Label>
            <div className="grid grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = sound === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSound(option.value)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground font-medium"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onStart({ workMinutes, breakMinutes, sound })}
          >
            <IconPlayerPlayFilled className="h-4 w-4 mr-1" />
            Start session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
