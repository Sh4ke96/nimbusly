"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  APP_MODULE_DISCOVER_IDS,
  getAppModuleDesc,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleOverviewMeta,
  getAppModuleRoute,
} from "@/lib/constants/app-modules";
import { overviewAccentStyles } from "@/components/dashboard/sortable-overview-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface MobileModulesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileModulesSheet({ open, onOpenChange }: MobileModulesSheetProps) {
  const t = useT();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] rounded-none border-x-0 border-b-0 px-0 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <SheetHeader className="border-b border-border px-4 pb-4 text-left">
          <SheetTitle className="font-heading">{t.mobileNav.modules}</SheetTitle>
          <SheetDescription>{t.dashboard.modules}</SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-4 py-4">
          <div className="grid gap-3">
            {APP_MODULE_DISCOVER_IDS.map((moduleId) => {
              const Icon = getAppModuleIcon(moduleId);
              const accent = getAppModuleOverviewMeta(moduleId).overviewAccent;
              const accentStyles = overviewAccentStyles[accent];

              return (
                <Link
                  key={moduleId}
                  href={getAppModuleRoute(moduleId)}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "group flex items-center gap-4 rounded-none border border-border/80 bg-card/90 p-4 shadow-sm",
                    "transition-all duration-200 active:scale-[0.99]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-11 shrink-0 items-center justify-center rounded-none",
                      accentStyles.icon
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold">
                      {getAppModuleLabel(moduleId, t.dashboard.moduleLabels)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getAppModuleDesc(moduleId, t.dashboard.moduleDescs)}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/40" aria-hidden />
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
