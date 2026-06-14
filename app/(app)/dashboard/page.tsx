"use client";

import { AppHeader } from "@/components/app/app-header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { SETTINGS_TAB } from "@/lib/profile/settings-tabs";
import {
  Wallet,
  ShoppingCart,
  Gift,
  Cake,
  CalendarDays,
  Users,
  Cross,
  Clapperboard,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardModule = {
  key: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  disabled?: boolean;
  href?: string;
};

export default function DashboardPage() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const modules: DashboardModule[] = [
    {
      key: "budget",
      label: t.dashboard.moduleLabels.budget,
      desc: t.dashboard.moduleDescs.budget,
      href: "/budget",
      Icon: Wallet,
    },
    {
      key: "shopping",
      label: t.dashboard.moduleLabels.shopping,
      desc: t.dashboard.moduleDescs.shopping,
      href: "/shopping",
      Icon: ShoppingCart,
    },
    {
      key: "gifts",
      label: t.dashboard.moduleLabels.gifts,
      desc: t.dashboard.moduleDescs.gifts,
      href: "/gifts",
      Icon: Gift,
    },
    {
      key: "birthdays",
      label: t.dashboard.moduleLabels.birthdays,
      desc: t.dashboard.moduleDescs.birthdays,
      href: "/birthdays",
      Icon: Cake,
    },
    {
      key: "calendar",
      label: t.dashboard.moduleLabels.calendar,
      desc: t.dashboard.moduleDescs.calendar,
      href: "/schedule",
      Icon: CalendarDays,
    },
    {
      key: "medicine-cabinet",
      label: t.dashboard.moduleLabels.medicineCabinet,
      desc: t.dashboard.moduleDescs.medicineCabinet,
      href: "/medicine-cabinet",
      Icon: Cross,
    },
    {
      key: "watchlist",
      label: t.dashboard.moduleLabels.watchlist,
      desc: t.dashboard.moduleDescs.watchlist,
      href: "/watchlist",
      Icon: Clapperboard,
    },
    {
      key: "restaurants",
      label: t.dashboard.moduleLabels.restaurants,
      desc: t.dashboard.moduleDescs.restaurants,
      href: "/restaurants",
      Icon: UtensilsCrossed,
    },
    {
      key: "family",
      label: t.dashboard.moduleLabels.family,
      desc: t.dashboard.moduleDescs.family,
      href:
        profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
          ? `/profile/settings?tab=${SETTINGS_TAB.FAMILY}`
          : `/profile/settings?tab=${SETTINGS_TAB.ACCOUNT}`,
      Icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-10">
        <div className="space-y-1">
          <h1 className="font-heading font-bold text-3xl tracking-tight">
            {t.dashboard.greeting}, {displayName} 👋
          </h1>
        </div>

        <DashboardOverview />

        <section>
          <h2 className="font-heading font-semibold text-xs mb-4 text-muted-foreground uppercase tracking-wider">
            {t.dashboard.modules}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const content = (
                <>
                  <span
                    className={cn(
                      "inline-flex size-11 items-center justify-center rounded-none transition-transform duration-200",
                      m.disabled
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary group-hover:scale-110 group-hover:-rotate-6"
                    )}
                  >
                    <m.Icon className="size-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-heading font-semibold text-sm",
                        m.disabled && "text-muted-foreground"
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {!m.disabled && (
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  )}
                </>
              );

              if (m.disabled) {
                return (
                  <div
                    key={m.key}
                    aria-disabled="true"
                    className="flex items-center gap-4 rounded-none border border-border bg-muted/30 p-5 opacity-75 cursor-not-allowed"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <a
                  key={m.key}
                  href={m.href}
                  className="group flex items-center gap-4 rounded-none border border-border bg-card p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  {content}
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
