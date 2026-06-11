"use client";

import { GemIcon, XpIcon } from "@/components/reward-icons";
import { cn } from "@/lib/utils";

export type TaskReward = {
  type: "xp" | "gems";
  amount: number;
};

type RewardBurstProps = {
  reward: TaskReward;
  className?: string;
};

/**
 * Brutalist reward chip: hard border, offset shadow, pop-in animation.
 * Rendered the moment a task is marked done.
 */
export function RewardBurst({ reward, className }: RewardBurstProps) {
  const isGems = reward.type === "gems";

  return (
    <span
      role="status"
      className={cn(
        "reward-burst inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-foreground",
        "shadow-[3px_3px_0_0_var(--foreground)]",
        className,
      )}
    >
      {isGems ? <GemIcon size={15} /> : <XpIcon size={15} />}
      {`+${reward.amount} ${isGems ? "gems" : "XP"}`}
    </span>
  );
}
