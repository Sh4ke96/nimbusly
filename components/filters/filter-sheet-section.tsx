"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FilterSheetSectionProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FilterSheetSection({
  label,
  hint,
  children,
  className,
}: FilterSheetSectionProps) {
  if (!children) return null;

  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}
