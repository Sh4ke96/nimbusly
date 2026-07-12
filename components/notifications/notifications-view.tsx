"use client";

import Link from "next/link";
import { Fragment, useActionState, useEffect, useState } from "react";
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
  parseNotificationModuleId,
} from "@/lib/notifications/filter-tabs";
import { NOTIFICATION_MODULE_IDS, type NotificationModuleId } from "@/lib/constants/notification-modules";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { markAllNotificationsRead } from "@/app/(app)/notifications/actions";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { SETTINGS_TAB, settingsTabHref } from "@/lib/profile/settings-tabs";
import { cn } from "@/lib/utils";

const MOBILE_FILTER_TAB_TRIGGER_CLASS = cn(
  "flex w-full min-w-0 flex-col items-center justify-center gap-1 rounded-none",
  "border-0 border-b-2 border-b-transparent px-1 py-3",
  "text-[11px] font-heading font-semibold leading-tight text-muted-foreground",
  "data-active:border-primary data-active:bg-primary/10 data-active:text-primary",
  "after:hidden whitespace-normal"
);

const DESKTOP_FILTER_TAB_TRIGGER_CLASS = cn(
  "w-full flex-none justify-start gap-3 rounded-none border border-transparent px-4 py-3.5",
  "text-sm font-heading font-semibold text-muted-foreground",
  "hover:bg-muted/60 hover:text-foreground",
  "data-active:border-primary data-active:bg-primary/10 data-active:text-primary",
  "after:hidden"
);

const MOBILE_FILTER_TABS_LIST_CLASS = cn(
  "!grid !h-auto !w-full max-w-none grid-cols-3 gap-0 rounded-none border-0",
  "border-b border-border bg-muted/30 p-0"
);

const DESKTOP_FILTER_TABS_LIST_CLASS = cn(
  "flex h-auto !w-full max-w-none flex-col items-stretch gap-0 rounded-none border-0 bg-transparent p-2"
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
  const moduleId = parseNotificationModuleId(searchParams.get("module"));
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
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

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

  const [desktopTabsLayout, setDesktopTabsLayout] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktopTabsLayout(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useStoreBootstrap(loaded, error, fetchNotifications);

  useEffect(() => {
    void fetchNotificationsPage({ filter, page, moduleId });
  }, [filter, page, moduleId, fetchNotificationsPage]);

  useActionFeedback(markAllState, () => {
    markAllReadLocally();
    void fetchNotifications(true);
    void fetchNotificationsPage({ filter, page, moduleId });
  });

  const locale = LOCALE_BY_LANG[lang];

  function handleFilterChange(nextFilter: string) {
    router.replace(
      notificationFilterHref(nextFilter as NotificationFilterTab, 1, moduleId)
    );
  }

  function handlePageChange(nextPage: number) {
    router.replace(notificationFilterHref(filter, nextPage, moduleId));
  }

  function handleModuleChange(nextModule: string) {
    const nextModuleId =
      nextModule === "all" ? null : (nextModule as NotificationModuleId);
    router.replace(notificationFilterHref(filter, 1, nextModuleId));
  }

  function handleItemMarkedRead() {
    void fetchNotifications(true);
    void fetchNotificationsPage({ filter, page, moduleId });
  }

  function handleItemDismissed() {
    void fetchNotifications(true);
    void fetchNotificationsPage({ filter, page, moduleId });
  }

  const visiblePageItems = pageItems.filter((item) => !dismissedIds.includes(item.id));

  function renderFilterTabTriggers(mobile: boolean) {
    return filterTabs.map((tab, index) => (
      <Fragment key={tab.value}>
        {!mobile && index > 0 ? <Separator /> : null}
        <TabsTrigger
          value={tab.value}
          className={
            mobile ? MOBILE_FILTER_TAB_TRIGGER_CLASS : DESKTOP_FILTER_TAB_TRIGGER_CLASS
          }
        >
          <tab.icon className={cn("shrink-0", mobile ? "size-4" : "size-5")} />
          <span
            className={cn(
              "flex min-w-0 items-center gap-2",
              mobile ? "flex-col text-center" : "flex-1 justify-between text-left"
            )}
          >
            <span className={mobile ? "line-clamp-2" : undefined}>{tab.label}</span>
            {tab.badge !== undefined ? (
              <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-none bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {tab.badge > 9 ? "9+" : tab.badge}
              </span>
            ) : null}
          </span>
        </TabsTrigger>
      </Fragment>
    ));
  }

  function renderNotificationsPanel() {
    return (
      <div
        className="min-w-0 w-full max-md:p-0 p-4 sm:p-6 md:p-8"
        data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTIFICATIONS_LIST}
      >
        <SettingsTabHeader
          icon={activeFilter.icon}
          title={activeFilter.label}
          className="hidden md:flex"
        />

        <div className="my-4 flex flex-wrap gap-2 max-md:px-4 md:px-0">
          <Button
            type="button"
            size="sm"
            variant={moduleId === null ? "default" : "outline"}
            className="rounded-none"
            onClick={() => handleModuleChange("all")}
          >
            {t.notifications.moduleFilterAll}
          </Button>
          {NOTIFICATION_MODULE_IDS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={moduleId === id ? "default" : "outline"}
              className="rounded-none"
              onClick={() => handleModuleChange(id)}
            >
              {t.dashboard.moduleLabels[id]}
            </Button>
          ))}
        </div>

        {pageError ? (
          <ModuleFetchError
            onRetry={() => void fetchNotificationsPage({ filter, page, moduleId })}
          />
        ) : pageLoading ? (
          <div className="space-y-2 max-md:px-4 md:px-0">
            <Skeleton className="h-16 w-full rounded-none" />
            <Skeleton className="h-16 w-full rounded-none" />
          </div>
        ) : visiblePageItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground max-md:px-4 md:px-0">
            {emptyMessageForFilter(filter, t)}
          </p>
        ) : (
          <>
            <ul className="w-full divide-y divide-border rounded-none border border-border max-md:border-x-0">
              {visiblePageItems.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  locale={locale}
                  onMarkReadLocally={markReadLocally}
                  onMarkedRead={handleItemMarkedRead}
                  onDismissLocally={(id) =>
                    setDismissedIds((current) =>
                      current.includes(id) ? current : [...current, id]
                    )
                  }
                  onDismissed={handleItemDismissed}
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
    );
  }

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="full" className="w-full max-md:max-w-none max-md:px-0">
        <div className="space-y-5 px-4 sm:space-y-6 sm:px-0">
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
              <Link
                href={settingsTabHref(SETTINGS_TAB.NOTIFICATIONS)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t.notifications.settingsLink}
              </Link>
            </div>
            {unreadCount > 0 && (
              <form action={markAllAction}>
                <Button type="submit" variant="outline">
                  {t.notifications.markAllRead}
                </Button>
              </form>
            )}
          </div>
        </div>

        <Card className="gap-0 rounded-none border-x-0 py-0 shadow-sm overflow-hidden max-md:ring-0 sm:border-x">
          <CardContent className="p-0 max-md:px-0">
            {error ? (
              <div className="p-4 sm:p-6 md:p-8">
                <ModuleFetchError onRetry={() => void fetchNotifications(true)} />
              </div>
            ) : (
              <Tabs
                orientation={desktopTabsLayout ? "vertical" : "horizontal"}
                value={filter}
                onValueChange={handleFilterChange}
                className={cn("w-full", desktopTabsLayout ? undefined : "flex-col gap-0")}
              >
                {desktopTabsLayout ? (
                  <div className="grid w-full grid-cols-[15rem_minmax(0,1fr)]">
                    <aside
                      className="border-r border-border bg-muted/30"
                      data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTIFICATIONS_FILTERS}
                    >
                      <TabsList variant="line" className={DESKTOP_FILTER_TABS_LIST_CLASS}>
                        {renderFilterTabTriggers(false)}
                      </TabsList>
                    </aside>
                    {renderNotificationsPanel()}
                  </div>
                ) : (
                  <>
                    <TabsList
                      variant="line"
                      className={MOBILE_FILTER_TABS_LIST_CLASS}
                      data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTIFICATIONS_FILTERS}
                    >
                      {renderFilterTabTriggers(true)}
                    </TabsList>
                    {renderNotificationsPanel()}
                  </>
                )}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </AppPage>
    </div>
  );
}
