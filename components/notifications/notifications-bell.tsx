"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationUnreadBadge } from "@/components/notifications/notification-unread-badge";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { NOTIFICATION_FILTER_TAB } from "@/lib/constants/notifications";
import { HEADER_ICON_BUTTON_CLASS } from "@/lib/ui/header-controls";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { getNotificationModuleId } from "@/lib/notifications/module-route";
import { SETTINGS_TAB } from "@/lib/profile/settings-tabs";
import { settingsTabHref } from "@/lib/profile/settings-tabs";

export function NotificationsBell() {
  const t = useT();
  const pathname = usePathname();
  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const loaded = useNotificationsStore((s) => s.loaded);

  const preview = items.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(HEADER_ICON_BUTTON_CLASS, "relative rounded-none")}
          aria-label={t.notifications.title}
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <NotificationUnreadBadge
              count={unreadCount}
              className="absolute -top-1 -right-1 min-w-4 h-4 text-[10px]"
            />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-none p-2">
        <DropdownMenuLabel className="font-heading font-semibold">
          {t.notifications.title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!loaded ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">{t.notifications.loading}</p>
        ) : preview.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">{t.notifications.empty}</p>
        ) : (
          preview.map((item) => {
            const moduleId = getNotificationModuleId(item.type);
            const moduleLabel = moduleId ? t.dashboard.moduleLabels[moduleId] : null;

            return (
              <DropdownMenuItem
                key={item.id}
                className={cn(
                  "flex flex-col items-start gap-1 py-2",
                  !item.read_at && "bg-primary/5"
                )}
                asChild
              >
                <Link href="/notifications">
                  {moduleLabel ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                      {moduleLabel}
                    </span>
                  ) : null}
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">{item.body}</span>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        {unreadCount > 0 ? (
          <DropdownMenuItem asChild>
            <Link
              href={`/notifications?filter=${NOTIFICATION_FILTER_TAB.UNREAD}`}
              className="w-full font-medium text-primary"
            >
              {t.notifications.tabUnread} ({unreadCount})
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className={cn("w-full font-medium", pathname === "/notifications" && "text-primary")}
          >
            {t.notifications.viewAll}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={settingsTabHref(SETTINGS_TAB.NOTIFICATIONS)} className="w-full font-medium">
            {t.notifications.settingsLink}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
