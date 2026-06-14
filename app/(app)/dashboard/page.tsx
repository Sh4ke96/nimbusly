"use client";

import { AppHeader } from "@/components/app/app-header";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";
import {
  Wallet,
  ShoppingCart,
  Gift,
  Cake,
  CalendarDays,
  Users,
  ArrowRight,
} from "lucide-react";

const moduleIcons = [Wallet, ShoppingCart, Gift, Cake, CalendarDays, Users];

export default function DashboardPage() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const modules = [
    { key: "budget", label: t.dashboard.moduleLabels.budget, desc: t.dashboard.moduleDescs.budget },
    { key: "shopping", label: t.dashboard.moduleLabels.shopping, desc: t.dashboard.moduleDescs.shopping },
    { key: "gifts", label: t.dashboard.moduleLabels.gifts, desc: t.dashboard.moduleDescs.gifts },
    { key: "birthdays", label: t.dashboard.moduleLabels.birthdays, desc: t.dashboard.moduleDescs.birthdays },
    { key: "calendar", label: t.dashboard.moduleLabels.calendar, desc: t.dashboard.moduleDescs.calendar },
    { key: "family", label: t.dashboard.moduleLabels.family, desc: t.dashboard.moduleDescs.family },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-10">
        <div className="space-y-1">
          <h1 className="font-heading font-bold text-3xl tracking-tight">
            {t.dashboard.greeting}, {displayName} 👋
          </h1>
        </div>

        <section>
          <h2 className="font-heading font-semibold text-xs mb-4 text-muted-foreground uppercase tracking-wider">
            {t.dashboard.modules}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m, i) => {
              const Icon = moduleIcons[i];
              return (
                <a
                  key={m.key}
                  href="#"
                  className="group flex items-center gap-4 rounded-none border border-border bg-card p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-none bg-primary/10 text-primary group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-200">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </a>
              );
            })}
          </div>
        </section>

        <div className="rounded-none border border-dashed border-border bg-muted/30 p-8 text-center space-y-2">
          <p className="font-heading font-semibold text-base">{t.dashboard.comingSoon}</p>
          <p className="text-sm text-muted-foreground">{t.dashboard.comingSoonDesc}</p>
        </div>
      </main>
    </div>
  );
}
