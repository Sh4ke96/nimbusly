import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AppModuleId } from "@/lib/constants/app-modules";
import {
  getAppModuleDesc,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleOverviewMeta,
  getAppModuleRoute,
} from "@/lib/constants/app-modules";
import { overviewAccentStyles } from "@/components/dashboard/sortable-overview-card";
import type { Dict } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { createElement } from "react";

interface ModuleDiscoverCardProps {
  moduleId: AppModuleId;
  labels: Dict["dashboard"]["moduleLabels"];
  descs: Dict["dashboard"]["moduleDescs"];
  onNavigate?: () => void;
  className?: string;
}

export function ModuleDiscoverCard({
  moduleId,
  labels,
  descs,
  onNavigate,
  className,
}: ModuleDiscoverCardProps) {
  const accent = getAppModuleOverviewMeta(moduleId).overviewAccent;
  const accentStyles = overviewAccentStyles[accent];

  return (
    <Link
      href={getAppModuleRoute(moduleId)}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-4 rounded-none border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
        accentStyles.ring,
        className
      )}
    >
      <span
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-none",
          accentStyles.icon
        )}
      >
        {createElement(getAppModuleIcon(moduleId), { className: "size-5", "aria-hidden": true })}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold">
          {getAppModuleLabel(moduleId, labels)}
        </p>
        <p className="text-xs text-muted-foreground">{getAppModuleDesc(moduleId, descs)}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/40" aria-hidden />
    </Link>
  );
}
