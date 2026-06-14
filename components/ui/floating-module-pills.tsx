"use client";

import type { CSSProperties } from "react";
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
              pillClassName
            )}
            style={style}
            title={label}
          >
            <Icon className="size-3.5 shrink-0 text-primary" />
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
