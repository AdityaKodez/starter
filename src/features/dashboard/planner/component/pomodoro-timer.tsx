"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconCoffee,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import {
  formatMs,
  type PomodoroSession,
} from "../hooks/use-pomodoro";
import { RewardBurst, type TaskReward } from "./reward-burst";

type PomodoroTimerProps = {
  session: PomodoroSession;
  remainingMs: number;
  isMarkingComplete: boolean;
  reward?: TaskReward | null;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onStartBreak: () => void;
  onToggleSound: () => void;
  onMarkComplete: () => void;
};

export function PomodoroTimer({
  session,
  remainingMs,
  isMarkingComplete,
  reward,
  onPause,
  onResume,
  onStop,
  onStartBreak,
  onToggleSound,
  onMarkComplete,
}: PomodoroTimerProps) {
  const isPaused = session.endsAt === null && session.phase !== "workDone";
  const totalMs =
    (session.phase === "break"
      ? session.settings.breakMinutes
      : session.settings.workMinutes) * 60_000;
  const progress = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;
  const hasSound = session.settings.sound !== "none";

  if (session.phase === "workDone") {
    return (
      <div className="mt-2 w-full rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">
            Session complete — task marked as done. Nice focus!
          </p>
          {reward && <RewardBurst reward={reward} />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onStartBreak}
          >
            <IconCoffee className="h-4 w-4 mr-1" />
            Take a {session.settings.breakMinutes} min break
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onMarkComplete}
            disabled={isMarkingComplete}
          >
            <IconCheck className="h-4 w-4 mr-1" />
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 w-full rounded-md border border-border bg-muted/40 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wide",
              session.phase === "break"
                ? "text-muted-foreground"
                : "text-primary",
            )}
          >
            {session.phase === "break"
              ? "Break"
              : isPaused
                ? "Paused"
                : "Focusing"}
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
            {formatMs(remainingMs)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasSound && session.phase === "work" && !isPaused && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onToggleSound}
              aria-label={session.soundOn ? "Mute background sound" : "Play background sound"}
            >
              {session.soundOn ? (
                <IconVolume className="h-4 w-4" />
              ) : (
                <IconVolumeOff className="h-4 w-4" />
              )}
            </Button>
          )}
          {session.phase === "work" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={isPaused ? onResume : onPause}
              aria-label={isPaused ? "Resume timer" : "Pause timer"}
            >
              {isPaused ? (
                <IconPlayerPlayFilled className="h-4 w-4" />
              ) : (
                <IconPlayerPauseFilled className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={onStop}
            aria-label={session.phase === "break" ? "End break" : "Stop session"}
          >
            <IconPlayerStopFilled className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
