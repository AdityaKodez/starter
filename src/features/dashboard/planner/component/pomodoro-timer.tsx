"use client";

import React from "react";
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
  isSkipped?: boolean;
  taskTitle?: string;
  taskReason?: string;
  taskStartTime?: string;
  taskEndTime?: string;
  taskDurationMinutes?: number;
  onSkip?: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onStartBreak: () => void;
  onToggleSound: () => void;
  onMarkComplete: () => void;
};

// ─── completion state ────────────────────────────────────────────────────────

type SessionCompleteProps = {
  breakMinutes:number;
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
    <div className="w-full space-y-0">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Done
          </p>
          <p className="text-sm text-muted-foreground">Session complete. Nice focus!</p>
          {reward && <RewardBurst reward={reward} className="mt-2" />}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onStartBreak}
          >
            <IconCoffee className="h-4 w-4 mr-1.5" />
            {`${breakMinutes} min break`}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onMarkComplete}
            disabled={isMarkingComplete}
          >
            <IconCheck className="h-4 w-4 mr-1.5" />
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── control dots ─────────────────────────────────────────────────────────────

type ControlDotsProps = {
  phase: PomodoroSession["phase"];
  isPaused: boolean;
  showSoundToggle: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onTogglePlay: () => void;
  onStop: () => void;
};

function ControlDots({
  phase,
  isPaused,
  showSoundToggle,
  soundOn,
  onToggleSound,
  onTogglePlay,
  onStop,
}: ControlDotsProps) {
  const isBreak = phase === "break";

  type Control = {
    key: string;
    label: string;
    active: boolean;
    icon: React.ReactNode;
    onClick: () => void;
  };

  const controls: Control[] = (
    [
      showSoundToggle
        ? ({
            key: "sound",
            label: soundOn ? "Mute" : "Unmute",
            active: soundOn,
            icon: soundOn ? (
              <IconVolume className="h-4 w-4" />
            ) : (
              <IconVolumeOff className="h-4 w-4" />
            ),
            onClick: onToggleSound,
          } satisfies Control)
        : null,
      !isBreak
        ? ({
            key: "play",
            label: isPaused ? "Resume" : "Pause",
            active: !isPaused,
            icon: isPaused ? (
              <IconPlayerPlayFilled className="h-4 w-4" />
            ) : (
              <IconPlayerPauseFilled className="h-4 w-4" />
            ),
            onClick: onTogglePlay,
          } satisfies Control)
        : null,
      {
        key: "stop",
        label: isBreak ? "End break" : "Stop",
        active: false,
        icon: <IconPlayerStopFilled className="h-4 w-4" />,
        onClick: onStop,
      } satisfies Control,
    ] as (Control | null)[]
  ).filter((c): c is Control => c !== null);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {controls.map((c) => (
        <button
          key={c.key}
          type="button"
          aria-label={c.label}
          onClick={c.onClick}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            c.active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {c.icon}
        </button>
      ))}
    </div>
  );
}

// ─── main timer ───────────────────────────────────────────────────────────────

export function PomodoroTimer({
  session,
  remainingMs,
  isMarkingComplete,
  reward,
  isSkipped = false,
  onSkip,
  onPause,
  onResume,
  onStop,
  onStartBreak,
  onToggleSound,
  onMarkComplete,
}: PomodoroTimerProps) {
  const { phase, settings, soundOn } = session;

  // Task was skipped while the timer was running — stop audio and unmount.
  if (isSkipped) return null;

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
  const phaseLabel = isBreak ? "Break" : isPaused ? "Paused" : "Focusing";

  const totalMs =
    (isBreak ? settings.breakMinutes : settings.workMinutes) * 60_000;
  const progress = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;

  const showSoundToggle = settings.sound !== "none" && isFocusing;

  const timeRangeParts: string[] = [];
 
  const timeRange = timeRangeParts.join(" · ");

  return (
    <div className="w-full space-y-0 border-t border-border/60">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="space-y-0.5">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-widest",
              isBreak ? "text-muted-foreground" : "text-primary",
            )}
          >
            {phaseLabel}
          </p>
          <p className="font-mono text-5xl font-thin tabular-nums leading-none text-foreground">
            {formatMs(remainingMs)}
          </p>
          {timeRange && (
            <p className="pt-1 text-xs text-muted-foreground">{timeRange}</p>
          )}
        </div>

        <ControlDots
          phase={phase}
          isPaused={isPaused}
          showSoundToggle={showSoundToggle}
          soundOn={soundOn}
          onToggleSound={onToggleSound}
          onTogglePlay={isPaused ? onResume : onPause}
          onStop={onStop}
        />
      </div>

      {/* ── progress bar ─────────────────────────────────────────────────── */}
      <Progress value={progress} className="h-1 rounded-none" />
    </div>
  );
}
