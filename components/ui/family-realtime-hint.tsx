"use client";

import { Radio } from "lucide-react";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface FamilyRealtimeHintProps {
  className?: string;
}

export function FamilyRealtimeHint({ className }: FamilyRealtimeHintProps) {
  const t = useT();

  return (
    <p
      className={cn(
        "flex items-center gap-2.5 border border-border bg-card px-3 py-2 text-xs text-foreground shadow-sm",
        className
      )}
    >
      <span
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary"
        aria-hidden
      >
        <Radio className="size-3.5" />
      </span>
      {t.common.familyRealtimeHint}
    </p>
  );
}
