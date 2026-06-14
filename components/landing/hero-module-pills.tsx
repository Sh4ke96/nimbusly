"use client";

import type { CSSProperties } from "react";
import {
  Cake,
  CalendarDays,
  Clapperboard,
  Cross,
  Gift,
  ListChecks,
  PawPrint,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/lib/lang-context";
import type { Dict } from "@/lib/i18n/types";

type ModuleLabelKey = keyof Dict["dashboard"]["moduleLabels"];

const HERO_MODULES: { key: ModuleLabelKey; icon: LucideIcon }[] = [
  { key: "budget", icon: Wallet },
  { key: "shopping", icon: ShoppingCart },
  { key: "gifts", icon: Gift },
  { key: "medicineCabinet", icon: Cross },
  { key: "watchlist", icon: Clapperboard },
  { key: "restaurants", icon: UtensilsCrossed },
  { key: "pets", icon: PawPrint },
  { key: "chores", icon: ListChecks },
  { key: "birthdays", icon: Cake },
  { key: "calendar", icon: CalendarDays },
  { key: "family", icon: Users },
];

/** Fixed scatter positions — looks random, stays stable across renders. */
const MODULE_POSITIONS = [
  { top: "5%", left: "3%", duration: "4.2s", delay: "0s" },
  { top: "7%", left: "55%", duration: "3.6s", delay: "0.5s" },
  { top: "20%", left: "74%", duration: "4.8s", delay: "1.1s" },
  { top: "16%", left: "24%", duration: "3.9s", delay: "0.2s" },
  { top: "34%", left: "5%", duration: "4.4s", delay: "0.8s" },
  { top: "40%", left: "46%", duration: "3.5s", delay: "0.4s" },
  { top: "32%", left: "80%", duration: "4.1s", delay: "1.3s" },
  { top: "52%", left: "14%", duration: "3.7s", delay: "0.6s" },
  { top: "56%", left: "60%", duration: "4.5s", delay: "0.9s" },
  { top: "70%", left: "4%", duration: "3.8s", delay: "0.3s" },
  { top: "74%", left: "38%", duration: "4.3s", delay: "1s" },
] as const;

export function HeroModulePills() {
  const t = useT();

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      {HERO_MODULES.map(({ key, icon: Icon }, i) => {
        const pos = MODULE_POSITIONS[i];
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
            className="hero-module-pill absolute inline-flex max-w-[calc(100%-1rem)] items-center gap-1.5 border border-border/80 bg-card/92 px-2 py-1 text-[10px] font-semibold text-foreground shadow-md backdrop-blur-sm sm:max-w-none sm:px-2.5 sm:py-1.5 sm:text-xs"
            style={style}
            title={label}
          >
            <Icon className="size-3.5 shrink-0 text-primary" />
            <span className="hidden min-[420px]:inline truncate max-w-26 sm:max-w-30">
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
