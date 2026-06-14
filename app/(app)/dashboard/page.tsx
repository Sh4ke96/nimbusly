"use client";

import { AppHeader } from "@/components/app/app-header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import {
  APP_MODULE_IDS,
  getAppModuleDesc,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleRoute,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardModule = {
  key: AppModuleId;
  label: string;
  desc: string;
  Icon: LucideIcon;
  href: string;
};

export default function DashboardPage() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const modules: DashboardModule[] = APP_MODULE_IDS.map((moduleId) => ({
    key: moduleId,
    label: getAppModuleLabel(moduleId, t.dashboard.moduleLabels),
    desc: getAppModuleDesc(moduleId, t.dashboard.moduleDescs),
    href: getAppModuleRoute(moduleId, profile),
    Icon: getAppModuleIcon(moduleId),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-10">
        <div className="space-y-1 animate-rise">
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
                      "bg-primary/10 text-primary group-hover:scale-110 group-hover:-rotate-6"
                    )}
                  >
                    <m.Icon className="size-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </>
              );

              return (
                <a
                  key={m.key}
                  href={m.href}
                  className="group flex items-center gap-4 rounded-none border border-border/80 bg-card/90 backdrop-blur-sm p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
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
