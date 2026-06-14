"use client";

import Link from "next/link";
import { LayoutGrid, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  APP_MODULE_NAV_IDS,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleRoute,
  getFamilyModuleRoute,
} from "@/lib/constants/app-modules";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

export function AppModuleNav() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const familyHref = getFamilyModuleRoute(profile);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            HEADER_CONTROL_HEIGHT,
            "rounded-none shrink-0 border-border bg-muted/50 text-muted-foreground",
            "hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          )}
          aria-label={t.dashboard.modules}
          title={t.dashboard.modules}
        >
          <LayoutGrid className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-none">
        {APP_MODULE_NAV_IDS.map((moduleId) => {
          const Icon = getAppModuleIcon(moduleId);
          return (
            <DropdownMenuItem key={moduleId} asChild className="rounded-none cursor-pointer">
              <Link href={getAppModuleRoute(moduleId)} className="flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                {getAppModuleLabel(moduleId, t.dashboard.moduleLabels)}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem asChild className="rounded-none cursor-pointer">
          <Link href={familyHref} className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            {t.dashboard.moduleLabels.family}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
