"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { APP_MODULE_DISCOVER_IDS } from "@/lib/constants/app-modules";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { ModuleDiscoverCard } from "@/components/app/module-discover-card";
import { useT } from "@/lib/lang-context";

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
        data-nimbus-tour={NIMBUS_TOUR_TARGET.MOBILE_MODULES_SHEET}
      >
        <SheetHeader className="border-b border-border px-4 pb-4 text-left">
          <SheetTitle className="font-heading">{t.mobileNav.modules}</SheetTitle>
          <SheetDescription>{t.dashboard.modules}</SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto px-4 py-4">
          <div className="grid gap-3">
            {APP_MODULE_DISCOVER_IDS.map((moduleId) => (
              <ModuleDiscoverCard
                key={moduleId}
                moduleId={moduleId}
                labels={t.dashboard.moduleLabels}
                descs={t.dashboard.moduleDescs}
                onNavigate={() => onOpenChange(false)}
              />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
