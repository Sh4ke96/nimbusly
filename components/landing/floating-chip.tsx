"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FloatingChipProps {
  icon: ReactNode;
  label: string;
  className?: string;
  delay?: string;
}

export function FloatingChip({ icon, label, className, delay = "0s" }: FloatingChipProps) {
  return (
    <span
      className={cn(
        "animate-rise inline-flex items-center gap-1.5 rounded-full",
        "bg-card/95 backdrop-blur-sm border border-border",
        "px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg",
        className
      )}
      style={{ animationDelay: delay }}
    >
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}
