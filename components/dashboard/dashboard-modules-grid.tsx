"use client";

import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppModuleId } from "@/lib/constants/app-modules";
import { cn } from "@/lib/utils";

export interface DashboardModuleItem {
  key: AppModuleId;
  label: string;
  desc: string;
  Icon: LucideIcon;
  href: string;
}

interface DashboardModulesGridProps {
  modules: DashboardModuleItem[];
}

export function DashboardModulesGrid({ modules }: DashboardModulesGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((module) => (
        <a
          key={module.key}
          href={module.href}
          className={cn(
            "group flex items-center gap-4 rounded-none border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm",
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          )}
        >
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-none transition-transform duration-200",
              "bg-primary/10 text-primary group-hover:scale-110 group-hover:-rotate-6"
            )}
          >
            <module.Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold">{module.label}</p>
            <p className="text-xs text-muted-foreground">{module.desc}</p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        </a>
      ))}
    </div>
  );
}
