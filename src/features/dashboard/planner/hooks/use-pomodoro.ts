"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ambientAudio, type AmbientSound } from "../lib/ambient-audio";

export type PomodoroPhase = "work" | "workDone" | "break";

export type PomodoroSettings = {
  workMinutes: number;
  breakMinutes: number;
  sound: AmbientSound;
};

export type PomodoroSession = {
  taskId: string;
  phase: PomodoroPhase;
  /** Wall-clock end time (ms epoch) while running, null while paused. */
  endsAt: number | null;
  /** Remaining ms, authoritative while paused. */
  remainingMs: number;
  settings: PomodoroSettings;
  soundOn: boolean;
};

const SESSION_KEY = "pomodoro-session";
const SETTINGS_KEY = "pomodoro-settings";

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  sound: "none",
};

function readSession(): PomodoroSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PomodoroSession;
    if (!session?.taskId || !session?.settings) return null;

    // Reconcile elapsed wall-clock time after a reload.
    if (session.endsAt !== null) {
      const remaining = session.endsAt - Date.now();
      if (remaining <= 0) {
        if (session.phase === "work") {
          return { ...session, phase: "workDone", endsAt: null, remainingMs: 0, soundOn: false };
        }
        // Break finished while away — session is over.
        return null;
      }
      // Browsers block autoplay after reload; sound resumes on user tap.
      return { ...session, remainingMs: remaining, soundOn: false };
    }
    return { ...session, soundOn: false };
  } catch {
    return null;
  }
}

function writeSession(session: PomodoroSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session === null) {
      window.localStorage.removeItem(SESSION_KEY);
    } else {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // storage unavailable (private mode etc.) — timer still works in-memory
  }
}

export function readLastSettings(): PomodoroSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PomodoroSettings>;
    return {
      workMinutes: parsed.workMinutes ?? DEFAULT_SETTINGS.workMinutes,
      breakMinutes: parsed.breakMinutes ?? DEFAULT_SETTINGS.breakMinutes,
      sound: parsed.sound ?? DEFAULT_SETTINGS.sound,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function usePomodoro({
  onWorkComplete,
}: {
  /** Fired once when the work phase finishes (chime already played). */
  onWorkComplete?: (taskId: string) => void;
} = {}) {
  const [session, setSessionState] = useState<PomodoroSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const onWorkCompleteRef = useRef(onWorkComplete);
  onWorkCompleteRef.current = onWorkComplete;

  // Restore persisted session after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    setSessionState(readSession());
  }, []);

  const setSession = useCallback(
    (
      update:
        | PomodoroSession
        | null
        | ((prev: PomodoroSession | null) => PomodoroSession | null),
    ) => {
      setSessionState((prev) => {
        const next = typeof update === "function" ? update(prev) : update;
        writeSession(next);
        return next;
      });
    },
    [],
  );

  const isRunning = session?.endsAt !== null && session?.phase !== "workDone";
  const remainingMs = session
    ? session.endsAt !== null
      ? Math.max(0, session.endsAt - now)
      : session.remainingMs
    : 0;

  // Tick while running.
  useEffect(() => {
    if (!session || session.endsAt === null) return;
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [session]);

  // Phase transitions when the clock runs out.
  useEffect(() => {
    if (!session || session.endsAt === null) return;
    if (session.endsAt - now > 0) return;

    if (session.phase === "work") {
      ambientAudio.stop();
      ambientAudio.chime();
      onWorkCompleteRef.current?.(session.taskId);
      setSession({ ...session, phase: "workDone", endsAt: null, remainingMs: 0, soundOn: false });
    } else if (session.phase === "break") {
      ambientAudio.stop();
      ambientAudio.chime();
      setSession(null);
    }
  }, [now, session, setSession]);

  const start = useCallback(
    (taskId: string, settings: PomodoroSettings) => {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        // non-critical
      }
      ambientAudio.play(settings.sound);
      const durationMs = settings.workMinutes * 60_000;
      setNow(Date.now());
      setSession({
        taskId,
        phase: "work",
        endsAt: Date.now() + durationMs,
        remainingMs: durationMs,
        settings,
        soundOn: settings.sound !== "none",
      });
    },
    [setSession],
  );

  const pause = useCallback(() => {
    ambientAudio.stop();
    setSession((prev) => {
      if (!prev || prev.endsAt === null) return prev;
      return {
        ...prev,
        endsAt: null,
        remainingMs: Math.max(0, prev.endsAt - Date.now()),
        soundOn: false,
      };
    });
  }, [setSession]);

  const resume = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.endsAt !== null || prev.phase === "workDone") return prev;
      if (prev.settings.sound !== "none") {
        ambientAudio.play(prev.settings.sound);
      }
      setNow(Date.now());
      return {
        ...prev,
        endsAt: Date.now() + prev.remainingMs,
        soundOn: prev.settings.sound !== "none",
      };
    });
  }, [setSession]);

  const stop = useCallback(() => {
    ambientAudio.stop();
    setSession(null);
  }, [setSession]);

  const startBreak = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const durationMs = prev.settings.breakMinutes * 60_000;
      setNow(Date.now());
      return {
        ...prev,
        phase: "break",
        endsAt: Date.now() + durationMs,
        remainingMs: durationMs,
        soundOn: false,
      };
    });
  }, [setSession]);

  const toggleSound = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.settings.sound === "none") return prev;
      if (prev.soundOn) {
        ambientAudio.stop();
        return { ...prev, soundOn: false };
      }
      ambientAudio.play(prev.settings.sound);
      return { ...prev, soundOn: true };
    });
  }, [setSession]);

  // Stop audio if the component unmounts entirely.
  useEffect(() => {
    return () => ambientAudio.stop();
  }, []);

  return {
    session,
    remainingMs,
    isRunning,
    start,
    pause,
    resume,
    stop,
    startBreak,
    toggleSound,
  };
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
