import type React from "react";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Aura brutalist logo mark.
 * Bold geometric "A" with a hard offset shadow — monochrome,
 * sharp corners, utilitarian. Inherits color via currentColor.
 */
export function Logo({ size = 24, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Hard offset shadow block */}
      <rect x="6" y="6" width="24" height="24" fill="currentColor" opacity="0.25" />
      {/* Main block */}
      <rect
        x="2"
        y="2"
        width="24"
        height="24"
        fill="currentColor"
      />
      {/* Geometric A — knocked out of the block */}
      <path
        d="M14 7 L21 21 L17.8 21 L16.4 18 L11.6 18 L10.2 21 L7 21 Z M14 11.6 L12.7 14.8 L15.3 14.8 Z"
        fill="var(--background)"
      />
      {/* Utilitarian tick — bottom right of block */}
      <rect x="20" y="22" width="3" height="3" fill="var(--background)" />
    </svg>
  );
}

/**
 * Full lockup: mark + wordmark. Use where the brand name should render
 * as part of the logo itself.
 */
export function LogoWordmark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo size={size} />
      <span className="font-mono text-sm font-extrabold uppercase tracking-[0.2em]">
        Aura
      </span>
    </span>
  );
}

export default Logo;
