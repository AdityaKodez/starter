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
import { formatMs, type PomodoroSession } from "../hooks/use-pomodoro";
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

type SessionCompleteProps = {
  breakMinutes: number;
  isMarkingComplete: boolean;
  reward?: TaskReward | null;
  onStartBreak: () => void;
  onMarkComplete: () => void;
};

function SessionComplete({
  breakMinutes,
  isMarkingComplete,
  reward,
  onStartBreak,
  onMarkComplete,
}: SessionCompleteProps) {
  return (
    <div className="mt-2 w-full rounded-md border border-primary/40 bg-primary/5 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Session complete. Nice focus!
        </p>
        {reward && <RewardBurst reward={reward} />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onStartBreak}>
          <IconCoffee className="h-4 w-4 mr-1" />
          {`${breakMinutes} min break`}
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
  const { phase, settings, soundOn } = session;

  if (phase === "workDone") {
    return (
      <SessionComplete
        breakMinutes={settings.breakMinutes}
        isMarkingComplete={isMarkingComplete}
        reward={reward}
        onStartBreak={onStartBreak}
        onMarkComplete={onMarkComplete}
      />
    );
  }

  const isBreak = phase === "break";
  const isPaused = session.endsAt === null;
  const isFocusing = phase === "work" && !isPaused;

  const totalMs =
    (isBreak ? settings.breakMinutes : settings.workMinutes) * 60_000;
  const progress = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;

  const phaseLabel = isBreak ? "Break" : isPaused ? "Paused" : "Focusing";
  const showSoundToggle = settings.sound !== "none" && isFocusing;

  return (
    <div className="mt-2 w-full p-2 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-wide",
              isBreak ? "text-muted-foreground" : "text-primary",
            )}
          >
            {phaseLabel}
          </span>
          <span className="font-mono text-xl font-think tabular-nums text-foreground">
            {formatMs(remainingMs)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {showSoundToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onToggleSound}
              aria-label={soundOn ? "Mute background sound" : "Play background sound"}
            >
              {soundOn ? (
                <IconVolume className="h-4 w-4" />
              ) : (
                <IconVolumeOff className="h-4 w-4" />
              )}
            </Button>
          )}
          {phase === "work" && (
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
            aria-label={isBreak ? "End break" : "Stop session"}
          >
            <IconPlayerStopFilled className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
