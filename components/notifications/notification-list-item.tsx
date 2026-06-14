"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  BIRTHDAY_NOTIFICATION_TYPES,
  BUDGET_NOTIFICATION_TYPES,
  GIFT_NOTIFICATION_TYPES,
  SCHEDULE_NOTIFICATION_TYPES,
  SHOPPING_LIST_NOTIFICATION_TYPES,
} from "@/lib/constants/notifications";
import type { AppNotification } from "@/lib/notifications/types";
import { getNotificationModuleIcon } from "@/lib/notifications/module-icon";
import { markNotificationRead } from "@/app/(app)/notifications/actions";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { cn } from "@/lib/utils";

function formatWhen(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

interface NotificationListItemProps {
  item: AppNotification;
  locale: string;
  onMarkedRead?: () => void;
  onMarkReadLocally: (id: string) => void;
}

export function NotificationListItem({
  item,
  locale,
  onMarkedRead,
  onMarkReadLocally,
}: NotificationListItemProps) {
  const t = useT();
  const [markState, markAction] = useActionState(markNotificationRead, null);
  const ModuleIcon = getNotificationModuleIcon(item.type);

  useActionFeedback(markState, () => {
    onMarkedRead?.();
  });

  return (
    <li
      className={cn(
        "flex gap-3 p-4",
        !item.read_at && "bg-primary/5"
      )}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
        <ModuleIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-sm">{item.title}</p>
          <time className="shrink-0 text-xs text-muted-foreground">
            {formatWhen(item.created_at, locale)}
          </time>
        </div>
        <p className="text-sm text-muted-foreground">{item.body}</p>
        {(BIRTHDAY_NOTIFICATION_TYPES as string[]).includes(item.type) && (
          <Link
            href="/birthdays"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.notifications.openBirthdays}
          </Link>
        )}
        {(SCHEDULE_NOTIFICATION_TYPES as string[]).includes(item.type) && (
          <Link
            href="/schedule"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.notifications.openSchedule}
          </Link>
        )}
        {(GIFT_NOTIFICATION_TYPES as string[]).includes(item.type) && (
          <Link
            href="/gifts"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.notifications.openGifts}
          </Link>
        )}
        {(BUDGET_NOTIFICATION_TYPES as string[]).includes(item.type) && (
          <Link
            href="/budget"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.notifications.openBudget}
          </Link>
        )}
        {(SHOPPING_LIST_NOTIFICATION_TYPES as string[]).includes(item.type) && (
          <Link
            href="/shopping"
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.notifications.openShoppingLists}
          </Link>
        )}
      </div>
      {!item.read_at && (
        <form
          action={markAction}
          onSubmit={() => onMarkReadLocally(item.id)}
        >
          <input type="hidden" name="id" value={item.id} />
          <Button type="submit" variant="ghost" size="sm" className="shrink-0">
            {t.notifications.markRead}
          </Button>
        </form>
      )}
    </li>
  );
}
