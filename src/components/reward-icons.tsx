import { cn } from "@/lib/utils";

type RewardIconProps = {
  size?: number;
  className?: string;
};

/**
 * Brutalist gem: hard-edged facets, thick single-weight outline,
 * flat fills driven by currentColor so it inherits the theme.
 */
export function GemIcon({ size = 16, className }: RewardIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {/* Body */}
      <path
        d="M7 3H17L21 9L12 21L3 9L7 3Z"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="miter"
      />
      {/* Crown facets */}
      <path
        d="M7 3L9.5 9M17 3L14.5 9M3 9H21M9.5 9L12 21L14.5 9"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="miter"
      />
      {/* Hard specular block — brutalist, no gradients */}
      <path d="M8.2 4.6H10.4L9.4 7H7.4L8.2 4.6Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Brutalist XP bolt: blocky lightning strike with a thick outline.
 */
export function XpIcon({ size = 16, className }: RewardIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M13 2L5 13H11L9 22L19 9H13L15 2H13Z"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="miter"
      />
    </svg>
  );
}
