"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Cake,
  CalendarDays,
  Cross,
  Gift,
  ListChecks,
  Scale,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MemberAvatar } from "@/components/member-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBirthdayLabel, type BirthdayEntry } from "@/lib/birthdays/types";
import { daysUntilBirthday, sortBirthdaysByUpcoming } from "@/lib/dashboard/birthdays";
import {
  formatBudgetAmount,
  netBalance,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import { filterEntriesByMonth, getCurrentMonthKey } from "@/lib/budget/monthly";
import { isMedicineExpiringSoon } from "@/lib/medicine/expiry";
import { BRAND_COLOR } from "@/lib/constants/brand";
import { BUDGET_EXPENSE_COLOR } from "@/lib/constants/budget";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { SETTINGS_TAB } from "@/lib/constants/settings";
import { SCHEDULE_ENTRY_EMOJI, type ScheduleEntryType } from "@/lib/constants/schedule";
import { parseEntryDateParts, getScheduleTypeLabel } from "@/lib/schedule/types";
import { formatMessage } from "@/lib/i18n/format";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";
import { useBudgetStore } from "@/lib/stores/budget-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useMedicineStore } from "@/lib/stores/medicine-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useShoppingListsStore } from "@/lib/stores/shopping-lists-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Accent = "primary" | "orange" | "violet" | "rose" | "sky" | "slate" | "emerald";

const accentStyles: Record<
  Accent,
  { icon: string; badge: string; ring: string }
> = {
  primary: {
    icon: "bg-primary/12 text-primary",
    badge: "bg-primary/8 text-primary border-primary/20",
    ring: "hover:border-primary/30",
  },
  orange: {
    icon: "bg-orange-500/12 text-orange-700 dark:text-orange-400",
    badge: "bg-orange-500/8 text-orange-800 dark:text-orange-300 border-orange-500/20",
    ring: "hover:border-orange-500/30",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
    badge: "bg-violet-500/8 text-violet-800 dark:text-violet-300 border-violet-500/20",
    ring: "hover:border-violet-500/30",
  },
  rose: {
    icon: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
    badge: "bg-rose-500/8 text-rose-800 dark:text-rose-300 border-rose-500/20",
    ring: "hover:border-rose-500/30",
  },
  sky: {
    icon: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
    badge: "bg-sky-500/8 text-sky-800 dark:text-sky-300 border-sky-500/20",
    ring: "hover:border-sky-500/30",
  },
  slate: {
    icon: "bg-muted text-muted-foreground",
    badge: "bg-muted/80 text-foreground border-border",
    ring: "hover:border-border",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500/8 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
    ring: "hover:border-emerald-500/30",
  },
};

function OverviewCard({
  href,
  title,
  icon: Icon,
  accent = "primary",
  children,
  className,
}: {
  href: string;
  title: string;
  icon: LucideIcon;
  accent?: Accent;
  children: React.ReactNode;
  className?: string;
}) {
  const t = useT();
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        "group rounded-none py-0 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        styles.ring,
        className
      )}
    >
      <CardHeader className="border-b border-border pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-none transition-transform duration-200 group-hover:scale-105",
                styles.icon
              )}
            >
              <Icon className="size-5" />
            </span>
            <CardTitle className="font-heading text-sm leading-tight pt-0.5">
              {title}
            </CardTitle>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline shrink-0 pt-1"
          >
            {t.dashboard.viewModule}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "income" | "expense" | "default";
}) {
  return (
    <div className="rounded-none border border-border bg-muted/30 px-2.5 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide">
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p
        className={cn(
          "font-heading text-sm font-semibold mt-1 truncate",
          tone === "income" && "text-primary",
          tone === "expense" && "text-orange-700 dark:text-orange-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center border border-dashed border-border bg-muted/20">
      <span className="inline-flex size-9 items-center justify-center rounded-none bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <p className="text-xs text-muted-foreground max-w-[14rem]">{text}</p>
    </div>
  );
}

function BigStat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent: Accent;
}) {
  const styles = accentStyles[accent];
  return (
    <div className="flex items-end gap-3">
      <p className="font-heading text-4xl font-bold tracking-tight leading-none">
        {value}
      </p>
      <p
        className={cn(
          "text-xs font-medium border px-2 py-1 mb-0.5 rounded-none",
          styles.badge
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function DashboardOverview() {
  const t = useT();
  const { lang } = useLang();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const family = useProfileStore((s) => s.family);

  const budgets = useBudgetStore((s) => s.budgets);
  const expensesByBudgetId = useBudgetStore((s) => s.expensesByBudgetId);
  const budgetLoaded = useBudgetStore((s) => s.loaded);
  const budgetLoading = useBudgetStore((s) => s.loading);
  const fetchBudgets = useBudgetStore((s) => s.fetchBudgets);

  const lists = useShoppingListsStore((s) => s.lists);
  const listsLoaded = useShoppingListsStore((s) => s.loaded);
  const listsLoading = useShoppingListsStore((s) => s.loading);
  const fetchLists = useShoppingListsStore((s) => s.fetchLists);

  const gifts = useGiftsStore((s) => s.ideas);
  const giftsLoaded = useGiftsStore((s) => s.loaded);
  const giftsLoading = useGiftsStore((s) => s.loading);
  const fetchIdeas = useGiftsStore((s) => s.fetchIdeas);

  const medicineItems = useMedicineStore((s) => s.items);
  const medicineLoaded = useMedicineStore((s) => s.loaded);
  const medicineLoading = useMedicineStore((s) => s.loading);
  const fetchMedicineItems = useMedicineStore((s) => s.fetchItems);

  const scheduleEntries = useScheduleStore((s) => s.entries);
  const scheduleLoaded = useScheduleStore((s) => s.loaded);
  const scheduleLoading = useScheduleStore((s) => s.loading);
  const fetchSchedule = useScheduleStore((s) => s.fetchEntries);

  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);

  const monthKey = getCurrentMonthKey();
  const now = new Date();
  const scheduleYear = now.getFullYear();
  const scheduleMonth = now.getMonth() + 1;

  const loadBirthdays = useCallback(async () => {
    setBirthdaysLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("birthday_entries")
      .select("*")
      .order("birth_month")
      .order("birth_day");
    setBirthdays((data ?? []) as BirthdayEntry[]);
    setBirthdaysLoading(false);
  }, []);

  useEffect(() => {
    if (!budgetLoaded && !budgetLoading) void fetchBudgets();
    if (!listsLoaded && !listsLoading) void fetchLists();
    if (!giftsLoaded && !giftsLoading) void fetchIdeas();
    if (!medicineLoaded && !medicineLoading) void fetchMedicineItems();
    if (!scheduleLoaded && !scheduleLoading) void fetchSchedule();
    void loadBirthdays();
  }, [
    budgetLoaded,
    budgetLoading,
    fetchBudgets,
    listsLoaded,
    listsLoading,
    fetchLists,
    giftsLoaded,
    giftsLoading,
    fetchIdeas,
    medicineLoaded,
    medicineLoading,
    fetchMedicineItems,
    scheduleLoaded,
    scheduleLoading,
    fetchSchedule,
    loadBirthdays,
  ]);

  const monthlyBudgetEntries = useMemo(() => {
    const all = budgets.flatMap((b) => expensesByBudgetId[b.id] ?? []);
    return filterEntriesByMonth(all, monthKey);
  }, [budgets, expensesByBudgetId, monthKey]);

  const incomeTotal = sumIncomeOnly(monthlyBudgetEntries);
  const expenseTotal = sumExpensesOnly(monthlyBudgetEntries);
  const balance = netBalance(monthlyBudgetEntries);

  const budgetChartData = useMemo(
    () =>
      [
        {
          key: "income",
          name: t.budget.incomeLabel,
          total: incomeTotal,
          fill: BRAND_COLOR.PRIMARY,
        },
        {
          key: "expense",
          name: t.budget.expensesLabel,
          total: expenseTotal,
          fill: BUDGET_EXPENSE_COLOR,
        },
      ].filter((row) => row.total > 0),
    [incomeTotal, expenseTotal, t.budget.incomeLabel, t.budget.expensesLabel]
  );

  const monthScheduleEntries = useMemo(
    () =>
      scheduleEntries.filter((entry) => {
        const parts = parseEntryDateParts(entry.entry_date);
        return parts.year === scheduleYear && parts.month === scheduleMonth;
      }),
    [scheduleEntries, scheduleYear, scheduleMonth]
  );

  const scheduleByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of monthScheduleEntries) {
      counts.set(entry.entry_type, (counts.get(entry.entry_type) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthScheduleEntries]);

  const upcomingBirthdays = useMemo(
    () => sortBirthdaysByUpcoming(birthdays).slice(0, 3),
    [birthdays]
  );

  const previewLists = useMemo(() => lists.slice(0, 3), [lists]);
  const previewGifts = useMemo(() => gifts.slice(0, 2), [gifts]);
  const expiringMedicines = useMemo(
    () => medicineItems.filter((item) => isMedicineExpiringSoon(item.expiry_date)),
    [medicineItems]
  );
  const previewMedicines = useMemo(
    () => expiringMedicines.slice(0, 3),
    [expiringMedicines]
  );

  const loading =
    (budgetLoading && !budgetLoaded) ||
    (listsLoading && !listsLoaded) ||
    (giftsLoading && !giftsLoaded) ||
    (medicineLoading && !medicineLoaded) ||
    (scheduleLoading && !scheduleLoaded) ||
    birthdaysLoading;

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider">
          {t.dashboard.overviewHeading}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-none" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider">
        {t.dashboard.overviewHeading}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OverviewCard
          href="/budget"
          title={t.dashboard.moduleLabels.budget}
          icon={Wallet}
          accent="primary"
          className="sm:col-span-2 xl:col-span-1"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
              <BarChart3 className="size-3.5 text-primary" />
              {t.dashboard.budgetThisMonth}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatTile
                label={t.budget.incomeLabel}
                value={formatBudgetAmount(incomeTotal, lang)}
                icon={TrendingUp}
                tone="income"
              />
              <StatTile
                label={t.budget.expensesLabel}
                value={formatBudgetAmount(expenseTotal, lang)}
                icon={TrendingDown}
                tone="expense"
              />
              <StatTile
                label={t.budget.balanceLabel}
                value={formatBudgetAmount(balance, lang)}
                icon={Scale}
              />
            </div>
            {budgetChartData.length > 0 ? (
              <div className="h-28 border border-border bg-muted/20 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetChartData}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) =>
                        formatBudgetAmount(Number(value ?? 0), lang)
                      }
                    />
                    <Bar dataKey="total" radius={0}>
                      {budgetChartData.map((row) => (
                        <Cell key={row.key} fill={row.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyHint icon={Wallet} text={t.dashboard.noData} />
            )}
          </div>
        </OverviewCard>

        <OverviewCard
          href="/shopping"
          title={t.dashboard.moduleLabels.shopping}
          icon={ShoppingCart}
          accent="orange"
        >
          {lists.length === 0 ? (
            <EmptyHint icon={ListChecks} text={t.dashboard.shoppingListsEmpty} />
          ) : (
            <div className="space-y-3">
              <BigStat
                value={lists.length}
                label={formatMessage(t.dashboard.shoppingListsCount, {
                  count: String(lists.length),
                })}
                accent="orange"
              />
              <ul className="space-y-1.5">
                {previewLists.map((list) => (
                  <li
                    key={list.id}
                    className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                  >
                    <ListChecks className="size-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
                    <span className="truncate font-medium">{list.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </OverviewCard>

        <OverviewCard
          href="/gifts"
          title={t.dashboard.moduleLabels.gifts}
          icon={Gift}
          accent="violet"
        >
          {gifts.length === 0 ? (
            <EmptyHint icon={Gift} text={t.dashboard.giftsEmpty} />
          ) : (
            <div className="space-y-3">
              <BigStat
                value={gifts.length}
                label={formatMessage(t.dashboard.giftsCount, {
                  count: String(gifts.length),
                })}
                accent="violet"
              />
              <ul className="space-y-1.5">
                {previewGifts.map((idea) => (
                  <li
                    key={idea.id}
                    className="text-sm border border-border bg-muted/20 px-2.5 py-2 line-clamp-2"
                  >
                    {idea.content.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </OverviewCard>

        <OverviewCard
          href="/medicine-cabinet"
          title={t.dashboard.moduleLabels.medicineCabinet}
          icon={Cross}
          accent="emerald"
        >
          {medicineItems.length === 0 ? (
            <EmptyHint icon={Cross} text={t.dashboard.medicineItemsEmpty} />
          ) : (
            <div className="space-y-3">
              <BigStat
                value={medicineItems.length}
                label={formatMessage(t.dashboard.medicineItemsCount, {
                  count: String(medicineItems.length),
                })}
                accent="emerald"
              />
              {expiringMedicines.length > 0 ? (
                <>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {formatMessage(t.dashboard.medicineExpiringCount, {
                      count: String(expiringMedicines.length),
                    })}
                  </p>
                  <ul className="space-y-1.5">
                    {previewMedicines.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                      >
                        <Cross className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="truncate font-medium">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          )}
        </OverviewCard>

        <OverviewCard
          href="/birthdays"
          title={t.dashboard.moduleLabels.birthdays}
          icon={Cake}
          accent="rose"
        >
          {upcomingBirthdays.length === 0 ? (
            <EmptyHint icon={Cake} text={t.dashboard.birthdaysEmpty} />
          ) : (
            <ul className="space-y-2">
              {upcomingBirthdays.map((entry) => {
                const days = daysUntilBirthday(entry.birth_month, entry.birth_day);
                const whenLabel =
                  days === 0
                    ? t.dashboard.birthdayToday
                    : formatMessage(t.dashboard.birthdayInDays, {
                        count: String(days),
                      });

                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 border border-border bg-muted/20 px-3 py-2.5"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-none bg-rose-500/10 text-rose-700 dark:text-rose-400">
                      <Cake className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{entry.person_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBirthdayLabel(entry)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 border rounded-none",
                        days === 0
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {whenLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </OverviewCard>

        <OverviewCard
          href="/schedule"
          title={t.dashboard.moduleLabels.calendar}
          icon={CalendarDays}
          accent="sky"
        >
          {monthScheduleEntries.length === 0 ? (
            <EmptyHint icon={CalendarDays} text={t.dashboard.scheduleEmpty} />
          ) : (
            <div className="space-y-3">
              <BigStat
                value={monthScheduleEntries.length}
                label={formatMessage(t.dashboard.scheduleThisMonth, {
                  count: String(monthScheduleEntries.length),
                })}
                accent="sky"
              />
              <ul className="space-y-1.5">
                {scheduleByType.slice(0, 4).map(([type, count]) => (
                  <li
                    key={type}
                    className="flex items-center justify-between gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none">
                        {SCHEDULE_ENTRY_EMOJI[type as ScheduleEntryType]}
                      </span>
                      <span className="truncate">
                        {getScheduleTypeLabel(
                          type as ScheduleEntryType,
                          t.schedule.typeLabels
                        )}
                      </span>
                    </span>
                    <span className="font-heading font-semibold text-sky-800 dark:text-sky-300 shrink-0">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </OverviewCard>

        <OverviewCard
          href={
            profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
              ? `/profile/settings?tab=${SETTINGS_TAB.FAMILY}`
              : `/profile/settings?tab=${SETTINGS_TAB.ACCOUNT}`
          }
          title={t.dashboard.moduleLabels.family}
          icon={Users}
          accent="slate"
        >
          {profile?.account_mode === ACCOUNT_MODE.FAMILY && members.length > 0 ? (
            <div className="space-y-3">
              {family?.name && (
                <div className="flex items-center gap-2 border border-border bg-primary/5 px-3 py-2">
                  <Users className="size-4 text-primary shrink-0" />
                  <p className="font-heading font-semibold text-sm">{family.name}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formatMessage(t.dashboard.familyMembers, {
                  count: String(members.length),
                })}
              </p>
              <ul className="space-y-2">
                {members.slice(0, 4).map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-2.5 text-sm border border-border bg-muted/20 px-2.5 py-2"
                  >
                    <MemberAvatar
                      name={getDisplayName(member)}
                      color={member.avatar_color}
                      size="sm"
                    />
                    <span className="truncate font-medium">{getDisplayName(member)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-none bg-muted text-muted-foreground">
                <User className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">{t.dashboard.familySolo}</p>
            </div>
          )}
        </OverviewCard>
      </div>
    </section>
  );
}
