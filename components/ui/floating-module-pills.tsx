"use client";

import type { CSSProperties } from "react";
import { overviewAccentStyles } from "@/components/dashboard/sortable-overview-card";
import { getAppModuleOverviewMeta } from "@/lib/constants/app-modules";
import { MODULE_PILL_ITEMS, MODULE_PILL_POSITIONS } from "@/lib/constants/module-pill-decor";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

type FloatingModulePillsProps = {
  className?: string;
  showLabels?: boolean;
  pillClassName?: string;
};

export function FloatingModulePills({
  className,
  showLabels = true,
  pillClassName,
}: FloatingModulePillsProps) {
  const t = useT();

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {MODULE_PILL_ITEMS.map(({ key, icon: Icon }, i) => {
        const pos = MODULE_PILL_POSITIONS[i];
        const label = t.dashboard.moduleLabels[key];
        const accentStyles = overviewAccentStyles[getAppModuleOverviewMeta(key).overviewAccent];
        const style = {
          top: pos.top,
          left: pos.left,
          "--hero-drift-duration": pos.duration,
          "--hero-drift-delay": pos.delay,
        } as CSSProperties;

        return (
          <span
            key={key}
            className={cn(
              "hero-module-pill absolute inline-flex max-w-[calc(100%-1rem)] items-center gap-1.5 border border-border/80 bg-card/92 px-2 py-1 text-[10px] font-semibold text-foreground shadow-md backdrop-blur-sm sm:max-w-none sm:px-2.5 sm:py-1.5 sm:text-xs",
              accentStyles.ring,
              pillClassName
            )}
            style={style}
            title={label}
          >
            <span
              className={cn(
                "inline-flex size-5 shrink-0 items-center justify-center rounded-none",
                accentStyles.icon
              )}
            >
              <Icon className="size-3" />
            </span>
            {showLabels && (
              <span className="hidden min-[420px]:inline truncate max-w-26 sm:max-w-30">
                {label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
