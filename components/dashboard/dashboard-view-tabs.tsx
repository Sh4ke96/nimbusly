"use client";

import { LayoutDashboard, LayoutGrid } from "lucide-react";
import {
  DASHBOARD_VIEW,
  DASHBOARD_VIEWS,
  type DashboardView,
} from "@/lib/constants/dashboard";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface DashboardViewTabsProps {
  value: DashboardView;
  onChange: (value: DashboardView) => void;
}

const VIEW_META: Record<
  DashboardView,
  { icon: typeof LayoutDashboard; labelKey: "overviewHeading" | "modules" }
> = {
  [DASHBOARD_VIEW.SUMMARY]: {
    icon: LayoutDashboard,
    labelKey: "overviewHeading",
  },
  [DASHBOARD_VIEW.MODULES]: {
    icon: LayoutGrid,
    labelKey: "modules",
  },
};

export function DashboardViewTabs({ value, onChange }: DashboardViewTabsProps) {
  const t = useT();

  return (
    <div
      role="tablist"
      aria-label={t.dashboard.viewTabsAriaLabel}
      className="flex border border-border bg-card shadow-sm"
    >
      {DASHBOARD_VIEWS.map((viewId) => {
        const { icon: Icon, labelKey } = VIEW_META[viewId];
        const selected = value === viewId;

        return (
          <button
            key={viewId}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
              "border-r border-border last:border-r-0",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            onClick={() => onChange(viewId)}
          >
            <Icon className="size-4 shrink-0" />
            <span className="font-heading">{t.dashboard[labelKey]}</span>
          </button>
        );
      })}
    </div>
  );
}
