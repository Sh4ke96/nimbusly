"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AppViewShell } from "@/components/app/app-view-shell";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import {
  APP_MODULE_IDS,
  getAppModuleDesc,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleRoute,
} from "@/lib/constants/app-modules";
import { hydrateDashboardSnapshot } from "@/lib/dashboard/hydrate-dashboard-snapshot";
import type { DashboardSnapshot } from "@/lib/dashboard/snapshot-types";
import { parseDashboardView } from "@/lib/dashboard/parse-view";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";

type DashboardPageClientProps = {
  snapshot: DashboardSnapshot | null;
};

export default function DashboardPageClient({ snapshot }: DashboardPageClientProps) {
  useEffect(() => {
    if (snapshot) {
      hydrateDashboardSnapshot(snapshot);
    }
  }, [snapshot]);

  const t = useT();
  const searchParams = useSearchParams();
  const initialView = parseDashboardView(searchParams.get("view"));
  const profileLoaded = useProfileStore((s) => s.loaded);
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  if (!profileLoaded) {
    return <DashboardPageSkeleton />;
  }

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const modules = APP_MODULE_IDS.map((moduleId) => ({
    key: moduleId,
    label: getAppModuleLabel(moduleId, t.dashboard.moduleLabels),
    desc: getAppModuleDesc(moduleId, t.dashboard.moduleDescs),
    href: getAppModuleRoute(moduleId),
    Icon: getAppModuleIcon(moduleId),
  }));

  return (
    <AppViewShell>
      <AppHeader />

      <AppPage width="full">
        <div className="animate-rise" data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_GREETING}>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight min-h-[2.25rem] sm:min-h-[2.75rem]">
            {t.dashboard.greeting}, {displayName} 👋
          </h1>
        </div>

        <DashboardHome modules={modules} initialView={initialView} />
      </AppPage>
    </AppViewShell>
  );
}
