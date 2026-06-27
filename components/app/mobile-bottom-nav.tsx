"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, LayoutGrid, LayoutDashboard, Settings } from "lucide-react";
import {
  MOBILE_NAV_HREF,
  MOBILE_NAV_ITEM,
  type MobileNavItem,
} from "@/lib/constants/mobile-nav";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: MobileNavItem; icon: typeof LayoutDashboard }[] = [
  { id: MOBILE_NAV_ITEM.HOME, icon: LayoutDashboard },
  { id: MOBILE_NAV_ITEM.MODULES, icon: LayoutGrid },
  { id: MOBILE_NAV_ITEM.NOTIFICATIONS, icon: Bell },
  { id: MOBILE_NAV_ITEM.SETTINGS, icon: Settings },
];

function isNavActive(pathname: string, search: string, item: MobileNavItem): boolean {
  if (item === MOBILE_NAV_ITEM.HOME) {
    return pathname === "/dashboard" && !search.includes("view=modules");
  }
  if (item === MOBILE_NAV_ITEM.MODULES) {
    return pathname === "/dashboard" && search.includes("view=modules");
  }
  if (item === MOBILE_NAV_ITEM.NOTIFICATIONS) {
    return pathname === "/notifications";
  }
  return pathname.startsWith("/profile/settings");
}

export function MobileBottomNav() {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const labels: Record<MobileNavItem, string> = {
    [MOBILE_NAV_ITEM.HOME]: t.mobileNav.home,
    [MOBILE_NAV_ITEM.MODULES]: t.mobileNav.modules,
    [MOBILE_NAV_ITEM.NOTIFICATIONS]: t.mobileNav.notifications,
    [MOBILE_NAV_ITEM.SETTINGS]: t.mobileNav.settings,
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 md:hidden app-mobile-bottom-nav",
        "border-t border-border bg-background",
        "shadow-[0_-1px_0_0_var(--border),0_-8px_24px_-4px_rgba(0,0,0,0.08)]"
      )}
      aria-label={t.mobileNav.ariaLabel}
    >
      <ul className="grid h-14 grid-cols-4">
        {NAV_ITEMS.map(({ id, icon: Icon }) => {
          const active = isNavActive(pathname, search, id);
          return (
            <li key={id} className="min-w-0">
              <Link
                href={MOBILE_NAV_HREF[id]}
                className={cn(
                  "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 px-1",
                  "text-[10px] font-medium leading-tight transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="w-full truncate text-center">{labels[id]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
