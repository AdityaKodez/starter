"use client";

import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            An unexpected error occurred. Please try again, and if the problem
            persists, refresh the page.
          </p>
        </div>

        <Button onClick={reset} variant="outline">
          <IconRefresh className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
