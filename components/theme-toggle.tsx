"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const cycle = () => {
    // Cycle: light → dark → system → light
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Switch theme (current: ${theme})`}
      className="relative w-9 h-9 rounded-full"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          resolvedTheme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
          resolvedTheme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
    </Button>
  );
}
