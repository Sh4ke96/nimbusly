import { createElement, type ReactNode } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AppViewShell } from "@/components/app/app-view-shell";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { overviewAccentStyles } from "@/components/dashboard/sortable-overview-card";
import {
  getAppModuleIcon,
  getAppModuleOverviewMeta,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import { cn } from "@/lib/utils";
import type { AppPageWidth } from "@/lib/ui/app-layout";

type ModulePageWidth = AppPageWidth;

interface ModulePageShellProps {
  children: ReactNode;
  width?: ModulePageWidth;
  className?: string;
}

export function ModulePageShell({ children, width = "default", className }: ModulePageShellProps) {
  return (
    <AppViewShell className={className}>
      <div className="no-print">
        <AppHeader />
      </div>
      <AppPage width={width}>{children}</AppPage>
    </AppViewShell>
  );
}

interface ModulePageHeaderProps {
  title: string;
  subtitle?: string;
  moduleId?: AppModuleId;
  breadcrumb?: string;
  tourTarget?: string;
  actions?: ReactNode;
  className?: string;
}

export function ModulePageHeader({
  title,
  subtitle,
  moduleId,
  breadcrumb,
  tourTarget,
  actions,
  className,
}: ModulePageHeaderProps) {
  const accent = moduleId ? getAppModuleOverviewMeta(moduleId).overviewAccent : null;
  const accentStyles = accent ? overviewAccentStyles[accent] : null;

  return (
    <>
      {breadcrumb ? (
        <div className="no-print">
          <AccountBreadcrumbs current={breadcrumb} />
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print",
          className
        )}
        data-nimbus-tour={tourTarget}
      >
        <div className="flex min-w-0 items-start gap-3">
          {moduleId && accentStyles ? (
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-none",
                accentStyles.icon
              )}
              aria-hidden
            >
              {createElement(getAppModuleIcon(moduleId), {
                className: "size-5",
                "aria-hidden": true,
              })}
            </span>
          ) : null}
          <div className="min-w-0 space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">{actions}</div>
        ) : null}
      </div>
    </>
  );
}
