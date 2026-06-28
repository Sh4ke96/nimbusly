"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, LayoutGrid, LayoutDashboard, Settings } from "lucide-react";
import { NimbusIcon } from "@/components/nimbus/nimbus-icon";
import {
  MOBILE_NAV_HREF,
  MOBILE_NAV_ITEM,
  type MobileNavItem,
} from "@/lib/constants/mobile-nav";
import { isMobileNavActive } from "@/lib/mobile-nav/is-nav-active";
import { NOTIFICATION_FILTER_TAB } from "@/lib/constants/notifications";
import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { NotificationUnreadBadge, formatUnreadNotificationCount } from "@/components/notifications/notification-unread-badge";
import { APP_MOBILE_BOTTOM_NAV_CLASS } from "@/lib/ui/app-layout";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { id: MobileNavItem; icon: typeof LayoutDashboard }[] = [
  { id: MOBILE_NAV_ITEM.HOME, icon: LayoutDashboard },
  { id: MOBILE_NAV_ITEM.MODULES, icon: LayoutGrid },
  { id: MOBILE_NAV_ITEM.NOTIFICATIONS, icon: Bell },
  { id: MOBILE_NAV_ITEM.SETTINGS, icon: Settings },
];

export function MobileBottomNav() {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const loaded = useProfileStore((s) => s.loaded);
  const profile = useProfileStore((s) => s.profile);
  const menuOpen = useNimbusStore((s) => s.menuOpen);
  const hintIndex = useNimbusStore((s) => s.hintIndex);
  const hintMessage = useNimbusStore((s) => s.hintMessage);
  const tourActive = useNimbusStore((s) => s.tourActive);
  const setMenuOpen = useNimbusStore((s) => s.setMenuOpen);
  const dismissHint = useNimbusStore((s) => s.dismissHint);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const showNimbus =
    loaded &&
    !!profile?.onboarding_completed &&
    profile.nimbus_companion_enabled !== false &&
    pathname !== "/onboarding";

  const nimbusAttention =
    !tourActive && (menuOpen || hintIndex !== null || hintMessage !== null);

  const labels: Record<MobileNavItem, string> = {
    [MOBILE_NAV_ITEM.HOME]: t.mobileNav.home,
    [MOBILE_NAV_ITEM.MODULES]: t.mobileNav.modules,
    [MOBILE_NAV_ITEM.NOTIFICATIONS]: t.mobileNav.notifications,
    [MOBILE_NAV_ITEM.SETTINGS]: t.mobileNav.settings,
  };

  function handleNimbusClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (tourActive) return;
    const next = !menuOpen;
    setMenuOpen(next);
    if (next) {
      dismissHint();
    }
  }

  function navHref(id: MobileNavItem): string {
    if (id === MOBILE_NAV_ITEM.NOTIFICATIONS && unreadCount > 0) {
      return `/notifications?filter=${NOTIFICATION_FILTER_TAB.UNREAD}`;
    }
    return MOBILE_NAV_HREF[id];
  }

  function navAriaLabel(id: MobileNavItem): string {
    if (id === MOBILE_NAV_ITEM.NOTIFICATIONS && unreadCount > 0) {
      return formatMessage(t.mobileNav.notificationsUnread, {
        count: formatUnreadNotificationCount(unreadCount),
      });
    }
    return labels[id];
  }

  function renderNavItem(id: MobileNavItem, icon: typeof LayoutDashboard) {
    const Icon = icon;
    const active = isMobileNavActive(pathname, search, id);

    return (
      <li key={id} className="min-w-0">
        <Link
          href={navHref(id)}
          className={cn(
            "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 px-1",
            "text-[10px] font-medium leading-tight transition-colors",
            active ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={active ? "page" : undefined}
          aria-label={navAriaLabel(id)}
        >
          <span className="relative inline-flex shrink-0">
            <Icon className="size-5" aria-hidden />
            {id === MOBILE_NAV_ITEM.NOTIFICATIONS ? (
              <NotificationUnreadBadge
                count={unreadCount}
                className="absolute -top-1.5 -right-2.5"
              />
            ) : null}
          </span>
          <span className="w-full truncate text-center">{labels[id]}</span>
        </Link>
      </li>
    );
  }

  return (
    <nav className={APP_MOBILE_BOTTOM_NAV_CLASS} aria-label={t.mobileNav.ariaLabel}>
      <ul className={cn("grid h-14", showNimbus ? "grid-cols-5" : "grid-cols-4")}>
        {NAV_ITEMS.slice(0, 2).map(({ id, icon }) => renderNavItem(id, icon))}

        {showNimbus ? (
          <li className="min-w-0">
            <button
              type="button"
              onClick={handleNimbusClick}
              className={cn(
                "relative flex h-full min-h-11 w-full flex-col items-center justify-center gap-0.5 px-1",
                "text-[10px] font-medium leading-tight transition-colors",
                menuOpen
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
              aria-label={t.companion.openMenuAria}
              aria-expanded={menuOpen}
              data-nimbus-mobile-nav-trigger
            >
              <NimbusIcon size={22} animated={nimbusAttention} />
              {nimbusAttention && !menuOpen ? (
                <span
                  className="absolute top-1.5 right-[calc(50%-1rem)] flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                  aria-hidden
                >
                  !
                </span>
              ) : null}
              <span className="w-full truncate text-center">{t.mobileNav.nimbus}</span>
            </button>
          </li>
        ) : null}

        {NAV_ITEMS.slice(2).map(({ id, icon }) => renderNavItem(id, icon))}
      </ul>
    </nav>
  );
}
