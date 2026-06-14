"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LOCALE_BY_LANG } from "@/lib/constants/lang";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { useLang, useT } from "@/lib/lang-context";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(app)/notifications/actions";
import { cn } from "@/lib/utils";
import { Cake } from "lucide-react";

function formatWhen(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function NotificationsView() {
  const t = useT();
  const { lang } = useLang();
  const items = useNotificationsStore((s) => s.items);
  const loaded = useNotificationsStore((s) => s.loaded);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const markReadLocally = useNotificationsStore((s) => s.markReadLocally);
  const markAllReadLocally = useNotificationsStore((s) => s.markAllReadLocally);

  const [markState, markAction] = useActionState(markNotificationRead, null);
  const [markAllState, markAllAction] = useActionState(markAllNotificationsRead, null);

  useEffect(() => {
    if (!loaded) void fetchNotifications();
  }, [loaded, fetchNotifications]);

  useActionFeedback(markState, () => void fetchNotifications(true));
  useActionFeedback(markAllState, () => {
    markAllReadLocally();
    void fetchNotifications(true);
  });

  const locale = LOCALE_BY_LANG[lang];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.notifications.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.notifications.title}</h1>
            <p className="text-sm text-muted-foreground">{t.notifications.subtitle}</p>
          </div>
          {items.some((item) => !item.read_at) && (
            <form action={markAllAction}>
              <Button type="submit" variant="outline">
                {t.notifications.markAllRead}
              </Button>
            </form>
          )}
        </div>

        <Card className="rounded-none py-0 shadow-sm">
          <CardContent className="p-0">
            {!loaded ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-16 w-full rounded-none" />
                <Skeleton className="h-16 w-full rounded-none" />
              </div>
            ) : items.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">{t.notifications.empty}</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex gap-3 p-4",
                      !item.read_at && "bg-primary/5"
                    )}
                  >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
                      <Cake className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-sm">{item.title}</p>
                        <time className="shrink-0 text-xs text-muted-foreground">
                          {formatWhen(item.created_at, locale)}
                        </time>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.body}</p>
                      {(item.type === NOTIFICATION_TYPE.BIRTHDAY_ADDED ||
                        item.type === NOTIFICATION_TYPE.BIRTHDAY_UPDATED) && (
                        <Link
                          href="/birthdays"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {t.notifications.openBirthdays}
                        </Link>
                      )}
                    </div>
                    {!item.read_at && (
                      <form
                        action={markAction}
                        onSubmit={() => markReadLocally(item.id)}
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <Button type="submit" variant="ghost" size="sm" className="shrink-0">
                          {t.notifications.markRead}
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">{t.notifications.emailComingSoon}</p>
      </main>
    </div>
  );
}
