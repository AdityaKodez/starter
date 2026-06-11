"use client";

import { GemIcon } from "@/components/reward-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function GemCounter() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.planner.getRewardBalance.queryOptions());

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          className="flex items-center gap-1.5 border-2 border-foreground bg-background px-2 py-0.5 text-xs font-bold tabular-nums text-foreground shadow-[2px_2px_0_0_var(--foreground)]"
          aria-label={`${data?.gems ?? 0} gems earned`}
        >
          <GemIcon size={14} />
          <span>{data?.gems ?? 0}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-56 text-pretty">
        Gems are earned by finishing focus sessions. Complete a Pomodoro and
        mark the task done for a chance at +10 gems or +25 XP.
      </TooltipContent>
    </Tooltip>
  );
}
