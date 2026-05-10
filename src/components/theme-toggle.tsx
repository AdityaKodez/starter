"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconMoon2, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

type ThemeToggleProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick"
>;

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeTheme = resolvedTheme ?? theme;
  const isDark = activeTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("relative", className)}
      {...props}
    >
      <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <IconMoon2 className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
