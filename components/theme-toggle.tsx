"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        HEADER_CONTROL_HEIGHT,
        "group relative w-8 rounded-none border-border bg-muted/50 text-muted-foreground",
        "hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute size-3.5 transition-all duration-300",
          isDark
            ? "rotate-0 scale-100 opacity-100 group-hover:rotate-45"
            : "-rotate-90 scale-0 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-3.5 transition-all duration-300",
          !isDark
            ? "rotate-0 scale-100 opacity-100 group-hover:-rotate-12"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
    </Button>
  );
}
