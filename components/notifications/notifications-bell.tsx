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
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useEffect } from "react";

export function NotificationsBell() {
  const t = useT();
  const pathname = usePathname();
  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const loaded = useNotificationsStore((s) => s.loaded);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const preview = items.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(HEADER_CONTROL_HEIGHT, "relative rounded-none shrink-0")}
          aria-label={t.notifications.title}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex min-w-4 h-4 items-center justify-center rounded-none bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
          preview.map((item) => (
            <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-1 py-2">
              <span className={cn("text-sm font-medium", !item.read_at && "text-primary")}>
                {item.title}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-2">{item.body}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className={cn("w-full", pathname === "/notifications" && "text-primary")}
          >
            {t.notifications.viewAll}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
