"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { DemoNav } from "@/components/demo/demo-nav";
import { DemoPanels } from "@/components/demo/demo-panels";
import { DEMO_ROUTE } from "@/lib/constants/demo-mode";
import { useT } from "@/lib/lang-context";
import { useDemoStore } from "@/lib/stores/demo-store";
import { cn } from "@/lib/utils";

interface DemoShellProps {
  embedded?: boolean;
  className?: string;
}

export function DemoShell({ embedded = false, className }: DemoShellProps) {
  const t = useT();
  const reset = useDemoStore((s) => s.reset);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border border-border bg-background shadow-lg",
        embedded ? "h-[min(42rem,72vh)] rounded-none" : "min-h-[calc(100vh-8rem)] rounded-none",
        className
      )}
      data-demo-shell
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Logo size="sm" href="/" asLink={!embedded} />
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            {t.demo.shellSubtitle}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span className="rounded-none border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100 sm:text-xs">
            {t.demo.badge}
          </span>
          <LanguageToggle className="hidden sm:flex" />
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden rounded-none sm:inline-flex"
            onClick={() => reset()}
          >
            <RotateCcw className="size-3.5" />
            {t.demo.resetBtn}
          </Button>
          {embedded ? (
            <Button type="button" size="sm" className="rounded-none" asChild>
              <Link href={DEMO_ROUTE}>{t.demo.openFull}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div
        role="status"
        className="border-b border-amber-500/25 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-950 dark:text-amber-50 sm:text-sm"
      >
        {t.demo.banner}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <DemoNav embedded={embedded} />
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-3 sm:p-4">
          <DemoPanels />
        </div>
      </div>

      {embedded ? (
        <div className="border-t border-border bg-card px-3 py-2 text-center sm:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full rounded-none"
            onClick={() => reset()}
          >
            <RotateCcw className="size-3.5" />
            {t.demo.resetBtn}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
