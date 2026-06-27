"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/ui/header-controls";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useT();
  const { setTheme } = useTheme();

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={t.theme.toggleLabel}
      className={cn(
        HEADER_ICON_BUTTON_CLASS,
        "group relative rounded-none border-border bg-muted/50 text-muted-foreground",
        "hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      <Sun className="absolute size-3.5 scale-100 rotate-0 opacity-100 transition-all duration-300 group-hover:rotate-45 dark:scale-0 dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute size-3.5 scale-0 rotate-90 opacity-0 transition-all duration-300 group-hover:-rotate-12 dark:scale-100 dark:rotate-0 dark:opacity-100" />
    </Button>
  );
}
