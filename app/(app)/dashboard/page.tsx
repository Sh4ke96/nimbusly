"use client";

import { AppHeader } from "@/components/app/app-header";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import {
  APP_MODULE_IDS,
  getAppModuleDesc,
  getAppModuleIcon,
  getAppModuleLabel,
  getAppModuleRoute,
} from "@/lib/constants/app-modules";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { getDisplayName } from "@/lib/profile";

export default function DashboardPage() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);

  const displayName = profile
    ? getDisplayName(profile)
    : user?.email?.split("@")[0] ?? "…";

  const modules = APP_MODULE_IDS.map((moduleId) => ({
    key: moduleId,
    label: getAppModuleLabel(moduleId, t.dashboard.moduleLabels),
    desc: getAppModuleDesc(moduleId, t.dashboard.moduleDescs),
    href: getAppModuleRoute(moduleId, profile),
    Icon: getAppModuleIcon(moduleId),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-6">
        <div className="animate-rise">
          <h1 className="font-heading font-bold text-3xl tracking-tight">
            {t.dashboard.greeting}, {displayName} 👋
          </h1>
        </div>

        <DashboardHome modules={modules} />
      </main>
    </div>
  );
}
