"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Pin, CalendarDays, ArrowRight, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { overviewAccentStyles } from "@/components/dashboard/sortable-overview-card";
import { DemoShell } from "@/components/demo/demo-shell";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
  MonthCalendarGrid,
  MonthCalendarNav,
} from "@/components/ui/month-calendar-grid";
import {
  FAMILY_CALENDAR_EVENT_KIND,
  type FamilyCalendarEventKind,
} from "@/lib/calendar/family-calendar";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import {
  familyCalendarEventStyles,
  familyCalendarLegendStyles,
} from "@/lib/ui/status-badge-styles";
import {
  DEMO_VIEW,
  isDemoModuleView,
  type DemoViewId,
} from "@/lib/constants/demo-mode";
import {
  APP_MODULE,
  APP_MODULE_DISCOVER_IDS,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleOverviewMeta,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import { DEMO_FAMILY_MEMBERS } from "@/lib/demo/fixtures";
import { useT } from "@/lib/lang-context";
import { useDemoStore } from "@/lib/stores/demo-store";
import { cn } from "@/lib/utils";

const DEMO_VIEW_ICONS: Record<DemoViewId, LucideIcon> = {
  [DEMO_VIEW.DASHBOARD]: LayoutDashboard,
  ...(Object.fromEntries(
    APP_MODULE_DISCOVER_IDS.map((moduleId) => [moduleId, getAppModuleIcon(moduleId)])
  ) as Record<AppModuleId, LucideIcon>),
};

const demoFamilyCalendarEventStyles: Record<FamilyCalendarEventKind, string> = {
  [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: familyCalendarEventStyles.birthday,
  [FAMILY_CALENDAR_EVENT_KIND.SCHEDULE]: familyCalendarEventStyles.schedule,
  [FAMILY_CALENDAR_EVENT_KIND.CHORE]: familyCalendarEventStyles.chore,
};

const demoFamilyCalendarLegendStyles: Record<FamilyCalendarEventKind, string> = {
  [FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY]: familyCalendarLegendStyles.birthday,
  [FAMILY_CALENDAR_EVENT_KIND.SCHEDULE]: familyCalendarLegendStyles.schedule,
  [FAMILY_CALENDAR_EVENT_KIND.CHORE]: familyCalendarLegendStyles.chore,
};

function DemoPanelHeading({
  view,
  hint,
}: {
  view: DemoViewId;
  hint?: string;
}) {
  const t = useT();
  const title =
    view === DEMO_VIEW.DASHBOARD
      ? t.demo.views.dashboard
      : getAppModuleLabel(view as AppModuleId, t.dashboard.moduleLabels);
  const Icon = DEMO_VIEW_ICONS[view];

  return (
    <div className="mb-4 space-y-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-none bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function DemoMetricCard({
  moduleId,
  value,
  detail,
}: {
  moduleId: AppModuleId;
  value: string;
  detail: string;
}) {
  const t = useT();
  const meta = getAppModuleOverviewMeta(moduleId);
  const accent = overviewAccentStyles[meta.overviewAccent];
  const Icon = DEMO_VIEW_ICONS[moduleId];
  const title = getAppModuleLabel(moduleId, t.dashboard.moduleLabels);

  return (
    <Card className={cn("rounded-none shadow-sm", accent.ring)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("inline-flex size-7 items-center justify-center rounded-none", accent.icon)}>
            <Icon className="size-3.5" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DemoDashboardPanel() {
  const t = useT();

  return (
    <div className="space-y-4">
      <DemoPanelHeading view={DEMO_VIEW.DASHBOARD} hint={t.demo.dashboardHint} />

      <section className="space-y-3 border border-primary/25 bg-primary/5 px-4 py-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <h3 className="font-heading text-sm font-semibold">{t.dashboard.todayHeading}</h3>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {t.demo.todayItems.map((item) => (
            <li
              key={item.label}
              className="flex items-start gap-2 border border-border bg-background/80 px-3 py-2.5 text-sm"
            >
              <span className="mt-0.5 text-primary">•</span>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DemoMetricCard
          moduleId={APP_MODULE.BUDGET}
          value={t.demo.metrics.budgetValue}
          detail={t.demo.metrics.budgetDetail}
        />
        <DemoMetricCard
          moduleId={APP_MODULE.SHOPPING}
          value={t.demo.metrics.shoppingValue}
          detail={t.demo.metrics.shoppingDetail}
        />
        <DemoMetricCard
          moduleId={APP_MODULE.CHORES}
          value={t.demo.metrics.choresValue}
          detail={t.demo.metrics.choresDetail}
        />
        <DemoMetricCard
          moduleId={APP_MODULE.BIRTHDAYS}
          value={t.demo.metrics.birthdaysValue}
          detail={t.demo.metrics.birthdaysDetail}
        />
        <DemoMetricCard
          moduleId={APP_MODULE.MEDICINE_CABINET}
          value={t.demo.metrics.medicineValue}
          detail={t.demo.metrics.medicineDetail}
        />
        <DemoMetricCard
          moduleId={APP_MODULE.PETS}
          value={t.demo.metrics.petsValue}
          detail={t.demo.metrics.petsDetail}
        />
      </div>
    </div>
  );
}

function DemoShoppingPanel() {
  const t = useT();
  const items = useDemoStore((s) => s.shoppingItems);
  const toggleChecked = useDemoStore((s) => s.toggleShoppingChecked);
  const bumpQuantity = useDemoStore((s) => s.bumpShoppingQuantity);
  const sampleItems = t.demo.samples.shoppingItems;

  return (
    <div>
      <DemoPanelHeading view={APP_MODULE.SHOPPING} hint={t.demo.shoppingHint} />
      <p className="mb-3 text-sm font-medium text-muted-foreground">{t.demo.samples.shoppingListName}</p>
      <ul className="space-y-2">
        {items.map((item) => {
          const sample = sampleItems[item.id];
          if (!sample) return null;
          return (
            <li
              key={item.id}
              className="flex items-center gap-2 border border-border bg-card px-3 py-2 shadow-sm"
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => toggleChecked(item.id)}
                className="cursor-pointer"
                aria-label={sample.name}
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", item.checked && "text-muted-foreground line-through")}>
                  {sample.name}
                </p>
                <p className="text-xs text-muted-foreground">{sample.category}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7 rounded-none cursor-pointer"
                  onClick={() => bumpQuantity(item.id, -1)}
                  aria-label={t.shoppingLists.decreaseQuantityLabel}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="min-w-7 text-center text-sm font-medium tabular-nums">
                  {item.quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7 rounded-none cursor-pointer"
                  onClick={() => bumpQuantity(item.id, 1)}
                  aria-label={t.shoppingLists.increaseQuantityLabel}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DemoChoresPanel() {
  const t = useT();
  const items = useDemoStore((s) => s.choreItems);
  const toggleDone = useDemoStore((s) => s.toggleChoreDone);
  const samples = t.demo.samples.chores;

  return (
    <div>
      <DemoPanelHeading view={APP_MODULE.CHORES} hint={t.demo.choresHint} />
      <ul className="space-y-2">
        {items.map((item) => {
          const sample = samples[item.id];
          if (!sample) return null;
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 border border-border bg-card px-3 py-3 shadow-sm"
            >
              <Checkbox
                checked={item.done}
                onCheckedChange={() => toggleDone(item.id)}
                className="cursor-pointer"
              />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", item.done && "text-muted-foreground line-through")}>
                  {sample.title}
                </p>
                <p className="text-xs text-muted-foreground">{sample.assignee}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DemoNotesPanel() {
  const t = useT();
  const notes = useDemoStore((s) => s.notes);
  const togglePinned = useDemoStore((s) => s.toggleNotePinned);
  const samples = t.demo.samples.notes;

  return (
    <div>
      <DemoPanelHeading view={APP_MODULE.NOTES} hint={t.demo.notesHint} />
      <ul className="space-y-2">
        {notes.map((note) => {
          const sample = samples[note.id];
          if (!sample) return null;
          return (
            <li
              key={note.id}
              className="flex items-start gap-3 border border-border bg-card px-3 py-3 shadow-sm"
            >
              <button
                type="button"
                className="mt-0.5 cursor-pointer text-muted-foreground hover:text-primary"
                onClick={() => togglePinned(note.id)}
                aria-label={note.pinned ? t.demo.unpinNote : t.demo.pinNote}
              >
                <Pin className={cn("size-4", note.pinned && "fill-primary text-primary")} />
              </button>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">{sample.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{sample.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DemoListPanel({
  view,
  hint,
  items,
}: {
  view: AppModuleId;
  hint: string;
  items: { title: string; detail: string; badge?: string }[];
}) {
  const meta = getAppModuleOverviewMeta(view);
  const accent = overviewAccentStyles[meta.overviewAccent];

  return (
    <div>
      <DemoPanelHeading view={view} hint={hint} />
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex items-start justify-between gap-3 border border-border bg-card px-3 py-3 shadow-sm"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            {item.badge ? (
              <span
                className={cn(
                  "shrink-0 rounded-none border px-2 py-0.5 text-[10px] font-semibold uppercase",
                  accent.badge
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DemoFamilyCalendarPanel() {
  const t = useT();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const events = t.demo.samples.familyCalendarEvents;

  const eventsByDay = useMemo(() => {
    const map = new Map<number, typeof events>();
    for (const event of events) {
      const list = map.get(event.day) ?? [];
      list.push(event);
      map.set(event.day, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekdays = getWeekdayLabels(t.birthdays.calendarWeekdays);
  const monthNames = t.birthdays.calendarMonths;

  function handlePrev() {
    const shifted = shiftMonth(year, month, -1);
    setYear(shifted.year);
    setMonth(shifted.month);
  }

  function handleNext() {
    const shifted = shiftMonth(year, month, 1);
    setYear(shifted.year);
    setMonth(shifted.month);
  }

  return (
    <div className="space-y-4">
      <DemoPanelHeading
        view={APP_MODULE.FAMILY_CALENDAR}
        hint={t.demo.familyCalendarHint}
      />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 border",
              demoFamilyCalendarLegendStyles[FAMILY_CALENDAR_EVENT_KIND.BIRTHDAY],
            )}
          />
          {t.familyCalendar.legendBirthday}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 border",
              demoFamilyCalendarLegendStyles[FAMILY_CALENDAR_EVENT_KIND.SCHEDULE],
            )}
          />
          {t.familyCalendar.legendSchedule}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 border",
              demoFamilyCalendarLegendStyles[FAMILY_CALENDAR_EVENT_KIND.CHORE],
            )}
          />
          {t.familyCalendar.legendChore}
        </span>
      </div>

      <MonthCalendarNav
        title={`${getMonthName(month, monthNames)} ${year}`}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <MonthCalendarGrid
        cells={cells}
        weekdays={weekdays}
        monthNames={monthNames}
        dayDataAttribute="demo-family-calendar-day"
        renderDayContent={({ day }) => {
          if (!day) return null;
          const dayEvents = eventsByDay.get(day) ?? [];
          return (
            <ul className="space-y-1">
              {dayEvents.map((event) => (
                <li key={`${event.day}-${event.kind}-${event.label}`}>
                  <span
                    className={cn(
                      MONTH_CALENDAR_ENTRY_BUTTON_CLASS,
                      "border",
                      demoFamilyCalendarEventStyles[event.kind],
                    )}
                  >
                    <span className="line-clamp-2">{event.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          );
        }}
      />
    </div>
  );
}

function DemoFamilyPanel() {
  const t = useT();
  const members = t.demo.samples.familyMembers;

  return (
    <div>
      <DemoPanelHeading view={APP_MODULE.FAMILY} hint={t.demo.familyHint} />
      <p className="mb-4 text-sm text-muted-foreground">{t.demo.samples.familyName}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {DEMO_FAMILY_MEMBERS.map((member) => {
          const sample = members[member.id];
          if (!sample) return null;
          return (
            <li
              key={member.id}
              className="flex items-center gap-3 border border-border bg-card px-3 py-3 shadow-sm"
            >
              <MemberAvatar
                name={sample.name}
                member={member.role}
                color={member.color}
                size="md"
                ring
              />
              <div>
                <p className="text-sm font-medium">{sample.name}</p>
                <p className="text-xs text-muted-foreground">{sample.role}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DemoStaticModulePanel({ view }: { view: AppModuleId }) {
  const t = useT();
  const samples = t.demo.samples;

  switch (view) {
    case APP_MODULE.BUDGET:
      return (
        <div>
          <DemoPanelHeading view={view} hint={t.demo.budgetHint} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="rounded-none">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{samples.budget.incomeLabel}</p>
                <p className="font-heading text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {samples.budget.income}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-none">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{samples.budget.expenseLabel}</p>
                <p className="font-heading text-xl font-bold">{samples.budget.expenses}</p>
              </CardContent>
            </Card>
            <Card className="rounded-none">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{samples.budget.balanceLabel}</p>
                <p className="font-heading text-xl font-bold text-primary">{samples.budget.balance}</p>
              </CardContent>
            </Card>
          </div>
          <ul className="mt-4 space-y-2">
            {samples.budget.items.map((item) => (
              <li
                key={item.title}
                className="flex items-center justify-between border border-border bg-card px-3 py-2 text-sm"
              >
                <span>{item.title}</span>
                <span className="font-medium tabular-nums">{item.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case APP_MODULE.GIFTS:
      return (
        <DemoListPanel view={view} hint={t.demo.giftsHint} items={samples.gifts} />
      );
    case APP_MODULE.BIRTHDAYS:
      return (
        <DemoListPanel view={view} hint={t.demo.birthdaysHint} items={samples.birthdays} />
      );
    case APP_MODULE.CALENDAR:
      return (
        <DemoListPanel view={view} hint={t.demo.calendarHint} items={samples.calendar} />
      );
    case APP_MODULE.MEDICINE_CABINET:
      return (
        <DemoListPanel view={view} hint={t.demo.medicineHint} items={samples.medicine} />
      );
    case APP_MODULE.WATCHLIST:
      return (
        <DemoListPanel view={view} hint={t.demo.watchlistHint} items={samples.watchlist} />
      );
    case APP_MODULE.RESTAURANTS:
      return (
        <DemoListPanel view={view} hint={t.demo.restaurantsHint} items={samples.restaurants} />
      );
    case APP_MODULE.PETS:
      return (
        <DemoListPanel view={view} hint={t.demo.petsHint} items={samples.pets} />
      );
    default:
      return null;
  }
}

export function DemoPanels() {
  const activeView = useDemoStore((s) => s.activeView);
  const t = useT();

  if (activeView === DEMO_VIEW.DASHBOARD) {
    return <DemoDashboardPanel />;
  }

  if (activeView === APP_MODULE.SHOPPING) {
    return <DemoShoppingPanel />;
  }

  if (activeView === APP_MODULE.CHORES) {
    return <DemoChoresPanel />;
  }

  if (activeView === APP_MODULE.NOTES) {
    return <DemoNotesPanel />;
  }

  if (activeView === APP_MODULE.FAMILY) {
    return <DemoFamilyPanel />;
  }

  if (activeView === APP_MODULE.FAMILY_CALENDAR) {
    return <DemoFamilyCalendarPanel />;
  }

  if (isDemoModuleView(activeView)) {
    return <DemoStaticModulePanel view={activeView} />;
  }

  return (
    <p className="text-sm text-muted-foreground">{t.demo.fallback}</p>
  );
}

export function DemoCtaFooter() {
  const t = useT();

  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-none border border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="space-y-1">
        <p className="font-heading font-semibold">{t.demo.ctaHeading}</p>
        <p className="text-sm text-muted-foreground">{t.demo.ctaDesc}</p>
      </div>
      <Button asChild className="rounded-none shrink-0">
        <Link href="/register">
          {t.demo.ctaBtn}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

export function DemoPageContent() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <DemoShell />
      <DemoCtaFooter />
    </div>
  );
}
