"use client";

import { Fragment, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, CheckCheck, Inbox, type LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { NotificationListItem } from "@/components/notifications/notification-list-item";
import { NotificationsPagination } from "@/components/notifications/notifications-pagination";
import { SettingsTabHeader } from "@/components/profile/settings/settings-tab-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCALE_BY_LANG } from "@/lib/constants/lang";
import {
  NOTIFICATION_FILTER_TAB,
  type NotificationFilterTab,
} from "@/lib/constants/notifications";
import { useLang, useT } from "@/lib/lang-context";
import {
  notificationFilterHref,
  parseNotificationFilterTab,
} from "@/lib/notifications/filter-tabs";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { markAllNotificationsRead } from "@/app/(app)/notifications/actions";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { cn } from "@/lib/utils";

const FILTER_TAB_TRIGGER_CLASS = cn(
  "w-full flex-none justify-start gap-3 rounded-none border border-transparent px-4 py-3.5",
  "text-sm font-heading font-semibold text-muted-foreground",
  "hover:bg-muted/60 hover:text-foreground",
  "data-active:border-primary data-active:bg-primary/10 data-active:text-primary",
  "after:hidden"
);

function parsePage(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function emptyMessageForFilter(
  filter: NotificationFilterTab,
  t: ReturnType<typeof useT>
): string {
  if (filter === NOTIFICATION_FILTER_TAB.UNREAD) {
    return t.notifications.emptyUnread;
  }
  if (filter === NOTIFICATION_FILTER_TAB.READ) {
    return t.notifications.emptyRead;
  }
  return t.notifications.empty;
}

export function NotificationsView() {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filter = parseNotificationFilterTab(searchParams.get("filter"));
  const page = parsePage(searchParams.get("page"));

  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const loaded = useNotificationsStore((s) => s.loaded);
  const error = useNotificationsStore((s) => s.error);
  const pageItems = useNotificationsStore((s) => s.pageItems);
  const pageTotal = useNotificationsStore((s) => s.pageTotal);
  const pageLoading = useNotificationsStore((s) => s.pageLoading);
  const pageError = useNotificationsStore((s) => s.pageError);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const fetchNotificationsPage = useNotificationsStore((s) => s.fetchNotificationsPage);
  const markReadLocally = useNotificationsStore((s) => s.markReadLocally);
  const markAllReadLocally = useNotificationsStore((s) => s.markAllReadLocally);

  const [markAllState, markAllAction] = useActionState(markAllNotificationsRead, null);

  const filterTabs: {
    value: NotificationFilterTab;
    icon: LucideIcon;
    label: string;
    badge?: number;
  }[] = [
    {
      value: NOTIFICATION_FILTER_TAB.ALL,
      icon: Inbox,
      label: t.notifications.tabAll,
    },
    {
      value: NOTIFICATION_FILTER_TAB.UNREAD,
      icon: Bell,
      label: t.notifications.tabUnread,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      value: NOTIFICATION_FILTER_TAB.READ,
      icon: CheckCheck,
      label: t.notifications.tabRead,
    },
  ];

  const activeFilter = filterTabs.find((tab) => tab.value === filter) ?? filterTabs[0];

  useStoreBootstrap(loaded, error, fetchNotifications);

  useEffect(() => {
    void fetchNotificationsPage({ filter, page });
  }, [filter, page, fetchNotificationsPage]);

  useActionFeedback(markAllState, () => {
    markAllReadLocally();
    void fetchNotifications(true);
    void fetchNotificationsPage({ filter, page });
  });

  const locale = LOCALE_BY_LANG[lang];

  function handleFilterChange(nextFilter: string) {
    router.replace(
      notificationFilterHref(nextFilter as NotificationFilterTab, 1)
    );
  }

  function handlePageChange(nextPage: number) {
    router.replace(notificationFilterHref(filter, nextPage));
  }

  function handleItemMarkedRead() {
    void fetchNotifications(true);
    void fetchNotificationsPage({ filter, page });
  }

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="narrow">
        <AccountBreadcrumbs current={t.notifications.title} />

        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTIFICATIONS_HEADER}
        >
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.notifications.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.notifications.subtitle}</p>
          </div>
          {unreadCount > 0 && (
            <form action={markAllAction}>
              <Button type="submit" variant="outline">
                {t.notifications.markAllRead}
              </Button>
            </form>
          )}
        </div>

        <Card className="gap-0 rounded-none py-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {error ? (
              <div className="p-6 md:p-8">
                <ModuleFetchError onRetry={() => void fetchNotifications(true)} />
              </div>
            ) : (
            <Tabs
              orientation="vertical"
              value={filter}
              onValueChange={handleFilterChange}
              className="w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)]">
                <aside
                  className="border-b border-border bg-muted/30 md:border-b-0 md:border-r"
                  data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTIFICATIONS_FILTERS}
                >
                  <TabsList
                    variant="line"
                    className="flex h-auto w-full flex-col items-stretch gap-0 rounded-none border-0 bg-transparent p-2"
                  >
                    {filterTabs.map((tab, index) => (
                      <Fragment key={tab.value}>
                        {index > 0 && <Separator />}
                        <TabsTrigger value={tab.value} className={FILTER_TAB_TRIGGER_CLASS}>
                          <tab.icon className="size-5 shrink-0" />
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && (
                              <span className="inline-flex min-w-4 h-4 shrink-0 items-center justify-center rounded-none bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                {tab.badge > 9 ? "9+" : tab.badge}
                              </span>
                            )}
                          </span>
                        </TabsTrigger>
                      </Fragment>
                    ))}
                  </TabsList>
                </aside>

                <div
                  className="min-w-0 p-6 md:p-8"
                  data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTIFICATIONS_LIST}
                >
                  <SettingsTabHeader
                    icon={activeFilter.icon}
                    title={activeFilter.label}
                  />

                  {pageError ? (
                    <ModuleFetchError
                      onRetry={() => void fetchNotificationsPage({ filter, page })}
                    />
                  ) : pageLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full rounded-none" />
                      <Skeleton className="h-16 w-full rounded-none" />
                    </div>
                  ) : pageItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {emptyMessageForFilter(filter, t)}
                    </p>
                  ) : (
                    <>
                      <ul className="divide-y divide-border rounded-none border border-border">
                        {pageItems.map((item) => (
                          <NotificationListItem
                            key={item.id}
                            item={item}
                            locale={locale}
                            onMarkReadLocally={markReadLocally}
                            onMarkedRead={handleItemMarkedRead}
                          />
                        ))}
                      </ul>
                      <NotificationsPagination
                        page={page}
                        totalItems={pageTotal}
                        onPageChange={handlePageChange}
                      />
                    </>
                  )}
                </div>
              </div>
            </Tabs>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          {t.notifications.deliveryChannelsHint}
        </p>
      </AppPage>
    </div>
  );
}
