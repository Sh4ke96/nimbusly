"use client";

import Link from "next/link";
import {
  Cake,
  CalendarDays,
  Clapperboard,
  Cross,
  Gift,
  LayoutGrid,
  ListChecks,
  PawPrint,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { SETTINGS_TAB } from "@/lib/profile/settings-tabs";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { cn } from "@/lib/utils";

const MODULE_LINKS = [
  { key: "budget", href: "/budget", icon: Wallet },
  { key: "shopping", href: "/shopping", icon: ShoppingCart },
  { key: "gifts", href: "/gifts", icon: Gift },
  { key: "birthdays", href: "/birthdays", icon: Cake },
  { key: "calendar", href: "/schedule", icon: CalendarDays },
  { key: "medicineCabinet", href: "/medicine-cabinet", icon: Cross },
  { key: "watchlist", href: "/watchlist", icon: Clapperboard },
  { key: "restaurants", href: "/restaurants", icon: UtensilsCrossed },
  { key: "pets", href: "/pets", icon: PawPrint },
  { key: "chores", href: "/chores", icon: ListChecks },
] as const;

export function AppModuleNav() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);

  const familyHref =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? `/profile/settings?tab=${SETTINGS_TAB.FAMILY}`
      : `/profile/settings?tab=${SETTINGS_TAB.ACCOUNT}`;

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
        {MODULE_LINKS.map(({ key, href, icon: Icon }) => (
          <DropdownMenuItem key={key} asChild className="rounded-none cursor-pointer">
            <Link href={href} className="flex items-center gap-2">
              <Icon className="size-4 text-primary" />
              {t.dashboard.moduleLabels[key]}
            </Link>
          </DropdownMenuItem>
        ))}
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
