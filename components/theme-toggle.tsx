"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "group relative inline-flex size-9 cursor-pointer items-center justify-center",
        "rounded-full border border-border bg-muted/50",
        "text-muted-foreground transition-all duration-200",
        "hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-sm",
        "active:scale-95",
        className
      )}
    >
      {/* Sun — shown in dark mode */}
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark
            ? "rotate-0 scale-100 opacity-100 group-hover:rotate-45"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
      {/* Moon — shown in light mode */}
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-300",
          !isDark
            ? "rotate-0 scale-100 opacity-100 group-hover:-rotate-12"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  );
}
