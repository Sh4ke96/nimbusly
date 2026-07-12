"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import {
  NotificationUnreadBadge,
  formatUnreadNotificationCount,
} from "@/components/notifications/notification-unread-badge";
import { APP_MOBILE_BOTTOM_NAV_CLASS } from "@/lib/ui/app-layout";
import { useClientSearchString } from "@/lib/hooks/use-client-search-string";
import { cn } from "@/lib/utils";

const NAV_ICONS = {
  [MOBILE_NAV_ITEM.HOME]: LayoutDashboard,
  [MOBILE_NAV_ITEM.MODULES]: LayoutGrid,
  [MOBILE_NAV_ITEM.NOTIFICATIONS]: Bell,
  [MOBILE_NAV_ITEM.SETTINGS]: Settings,
} as const;

const MOBILE_NAV_SLOT = {
  NIMBUS: "nimbus",
} as const;

type MobileNavSlot = MobileNavItem | typeof MOBILE_NAV_SLOT.NIMBUS;

const NAV_CELL_CLASS =
  "app-mobile-bottom-nav-control transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MobileBottomNav() {
  const t = useT();
  const pathname = usePathname();
  const search = useClientSearchString();
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

  const shortLabels: Record<MobileNavItem, string> = {
    [MOBILE_NAV_ITEM.HOME]: t.mobileNav.homeShort,
    [MOBILE_NAV_ITEM.MODULES]: t.mobileNav.modulesShort,
    [MOBILE_NAV_ITEM.NOTIFICATIONS]: t.mobileNav.notificationsShort,
    [MOBILE_NAV_ITEM.SETTINGS]: t.mobileNav.settingsShort,
  };

  const slots: MobileNavSlot[] = showNimbus
    ? [
        MOBILE_NAV_ITEM.HOME,
        MOBILE_NAV_ITEM.MODULES,
        MOBILE_NAV_SLOT.NIMBUS,
        MOBILE_NAV_ITEM.NOTIFICATIONS,
        MOBILE_NAV_ITEM.SETTINGS,
      ]
    : [
        MOBILE_NAV_ITEM.HOME,
        MOBILE_NAV_ITEM.MODULES,
        MOBILE_NAV_ITEM.NOTIFICATIONS,
        MOBILE_NAV_ITEM.SETTINGS,
      ];

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

  function renderNavLink(id: MobileNavItem) {
    const Icon = NAV_ICONS[id];
    const active = isMobileNavActive(pathname, search, id);

    return (
      <li key={id} className="app-mobile-bottom-nav-item">
        <Link
          href={navHref(id)}
          className={cn(
            NAV_CELL_CLASS,
            active ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={active ? "page" : undefined}
          aria-label={navAriaLabel(id)}
        >
          <span className="app-mobile-bottom-nav-icon relative">
            <Icon className="size-5" aria-hidden />
            {id === MOBILE_NAV_ITEM.NOTIFICATIONS ? (
              <NotificationUnreadBadge
                count={unreadCount}
                className="absolute -top-1.5 -right-2.5"
              />
            ) : null}
          </span>
          <span className="w-full truncate sm:hidden">{shortLabels[id]}</span>
          <span className="hidden w-full truncate sm:inline">{labels[id]}</span>
        </Link>
      </li>
    );
  }

  function renderNimbusSlot() {
    return (
      <li key={MOBILE_NAV_SLOT.NIMBUS} className="app-mobile-bottom-nav-item">
        <button
          type="button"
          onClick={handleNimbusClick}
          className={cn(
            NAV_CELL_CLASS,
            menuOpen ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-label={t.companion.openMenuAria}
          aria-expanded={menuOpen}
          data-nimbus-mobile-nav-trigger
        >
          <span className="app-mobile-bottom-nav-icon relative">
            <NimbusIcon size={20} animated={nimbusAttention} />
            {nimbusAttention && !menuOpen ? (
              <span
                className="absolute -top-1.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                aria-hidden
              >
                !
              </span>
            ) : null}
          </span>
          <span className="w-full truncate">{t.mobileNav.nimbus}</span>
        </button>
      </li>
    );
  }

  return (
    <nav className={APP_MOBILE_BOTTOM_NAV_CLASS} aria-label={t.mobileNav.ariaLabel}>
      <ul
        className={cn(
          "app-mobile-bottom-nav-items",
          showNimbus ? "app-mobile-bottom-nav-items--5" : "app-mobile-bottom-nav-items--4"
        )}
      >
        {slots.map((slot) =>
          slot === MOBILE_NAV_SLOT.NIMBUS ? renderNimbusSlot() : renderNavLink(slot)
        )}
      </ul>
    </nav>
  );
}
