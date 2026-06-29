"use client";

import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import Link from "next/link";
import { createElement, useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/notifications/types";
import { getNotificationModuleIcon } from "@/lib/notifications/module-icon";
import {
  getNotificationModuleHref,
  getNotificationModuleId,
  NOTIFICATION_MODULE_LINK_LABEL,
} from "@/lib/notifications/module-route";
import { markNotificationRead } from "@/app/(app)/notifications/actions";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
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
  const celebrate = useNimbusCelebration();
  const moduleId = getNotificationModuleId(item.type);
  const moduleHref = getNotificationModuleHref(item.type);
  const moduleLinkLabel = moduleId ? t.notifications[NOTIFICATION_MODULE_LINK_LABEL[moduleId]] : null;

  useActionFeedback(markState, () => {
    celebrate("firstNotification");
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
        {createElement(getNotificationModuleIcon(item.type), { className: "size-5" })}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {moduleId ? (
            <span className="inline-flex items-center rounded-none border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {t.dashboard.moduleLabels[moduleId]}
            </span>
          ) : null}
          <time className="text-xs text-muted-foreground">
            {formatWhen(item.created_at, locale)}
          </time>
        </div>
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-sm">{item.title}</p>
        </div>
        <p className="text-sm text-muted-foreground">{item.body}</p>
        {moduleHref && moduleLinkLabel && (
          <Link
            href={moduleHref}
            className="text-xs font-medium text-primary hover:underline"
          >
            {moduleLinkLabel}
          </Link>
        )}
      </div>
      {!item.read_at && (
        <form
          action={markAction}
          onSubmit={() => onMarkReadLocally(item.id)}
        >
          <input type="hidden" name={COMMON_FORM_FIELD.ID} value={item.id} />
          <Button type="submit" variant="ghost" size="sm" className="shrink-0">
            {t.notifications.markRead}
          </Button>
        </form>
      )}
    </li>
  );
}
