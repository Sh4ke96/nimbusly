"use client";

import type { AppModuleId } from "@/lib/constants/app-modules";
import { ModuleDiscoverCard } from "@/components/app/module-discover-card";
import { useT } from "@/lib/lang-context";

export interface DashboardModuleItem {
  key: AppModuleId;
}

interface DashboardModulesGridProps {
  modules: DashboardModuleItem[];
}

export function DashboardModulesGrid({ modules }: DashboardModulesGridProps) {
  const t = useT();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <ModuleDiscoverCard
          key={module.key}
          moduleId={module.key}
          labels={t.dashboard.moduleLabels}
          descs={t.dashboard.moduleDescs}
          className="p-5"
        />
      ))}
    </div>
  );
}
