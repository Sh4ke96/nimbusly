"use client";

import {
  DEMO_NAV_VIEWS,
  DEMO_VIEW,
  type DemoViewId,
} from "@/lib/constants/demo-mode";
import {
  getAppModuleIcon,
  getAppModuleLabel,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import { useT } from "@/lib/lang-context";
import { useDemoStore } from "@/lib/stores/demo-store";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoNavProps {
  embedded?: boolean;
}

function getDemoViewLabel(view: DemoViewId, t: ReturnType<typeof useT>): string {
  if (view === DEMO_VIEW.DASHBOARD) return t.demo.views.dashboard;
  return getAppModuleLabel(view, t.dashboard.moduleLabels);
}

export function DemoNav({ embedded = false }: DemoNavProps) {
  const t = useT();
  const activeView = useDemoStore((s) => s.activeView);
  const setActiveView = useDemoStore((s) => s.setActiveView);

  return (
    <nav
      aria-label={t.demo.navAria}
      className={cn(
        "shrink-0 border-border bg-card",
        embedded
          ? "border-b lg:w-52 lg:border-b-0 lg:border-r"
          : "border-b lg:w-56 lg:border-b-0 lg:border-r"
      )}
    >
      <ul
        className={cn(
          "flex gap-1 overflow-x-auto scroll-px-2 p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-x-visible lg:p-3",
          embedded ? "lg:max-h-none" : "lg:sticky lg:top-0"
        )}
      >
        {DEMO_NAV_VIEWS.map((view) => {
          const isActive = activeView === view;
          const Icon =
            view === DEMO_VIEW.DASHBOARD
              ? LayoutDashboard
              : getAppModuleIcon(view as AppModuleId);

          return (
            <li key={view} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => setActiveView(view)}
                className={cn(
                  "inline-flex w-full cursor-pointer items-center gap-2 rounded-none border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" />
                <span className="whitespace-nowrap lg:whitespace-normal">
                  {getDemoViewLabel(view, t)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
