"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { TodayItem } from "@/lib/dashboard/today";
import { TODAY_KIND_ICON } from "@/lib/dashboard/today";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";

interface DashboardTodayBannerProps {
  items: TodayItem[];
}

export function DashboardTodayBanner({ items }: DashboardTodayBannerProps) {
  const t = useT();

  if (items.length === 0) {
    return (
      <section
        className="border border-dashed border-border bg-muted/20 px-4 py-4 space-y-2"
        data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_TODAY}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            {t.dashboard.todayHeading}
          </h2>
          <Button type="button" variant="outline" size="sm" className="rounded-none" asChild>
            <Link href="/calendar">{t.dashboard.openFamilyCalendar}</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{t.dashboard.todayEmpty}</p>
      </section>
    );
  }

  return (
    <section
      className="border border-primary/25 bg-primary/5 px-4 py-4 space-y-3"
      data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_TODAY}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            {t.dashboard.todayHeading}
          </h2>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-none" asChild>
          <Link href="/calendar">{t.dashboard.openFamilyCalendar}</Link>
        </Button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = TODAY_KIND_ICON[item.kind];
          return (
            <li key={item.pinKey}>
              <Link
                href={item.href}
                className="flex items-start gap-2.5 border border-border bg-background/80 px-3 py-2.5 text-sm hover:border-primary/35 hover:bg-background transition-colors"
              >
                <Icon className="size-4 shrink-0 text-primary mt-0.5" aria-hidden />
                <span className="min-w-0">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
