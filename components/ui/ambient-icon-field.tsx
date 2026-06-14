"use client";

import type { CSSProperties } from "react";
import { getAmbientIcons } from "@/lib/constants/ambient-decor";
import { getAppModuleIcon } from "@/lib/constants/app-modules";
import { cn } from "@/lib/utils";

type AmbientIconFieldProps = {
  variant?: "auth" | "app" | "landing";
  className?: string;
};

export function AmbientIconField({ variant = "app", className }: AmbientIconFieldProps) {
  const icons = getAmbientIcons(variant);

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden>
      {icons.map((item) => {
        const Icon = getAppModuleIcon(item.key);
        const style = {
          top: item.top,
          left: item.left,
          opacity: item.opacity,
          "--icon-duration": item.duration,
          "--icon-delay": item.delay,
        } as CSSProperties;

        return (
          <div
            key={`${item.key}-${item.top}-${item.left}`}
            className="ambient-icon absolute inline-flex items-center justify-center rounded-none border border-primary/25 bg-card/40 p-2 text-primary shadow-sm backdrop-blur-[1px] dark:bg-card/25"
            style={style}
          >
            <Icon style={{ width: item.size, height: item.size }} strokeWidth={1.75} />
          </div>
        );
      })}
    </div>
  );
}
