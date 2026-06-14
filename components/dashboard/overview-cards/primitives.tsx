import type { LucideIcon } from "lucide-react";
import { overviewAccentStyles, type OverviewAccent } from "@/components/dashboard/sortable-overview-card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "income" | "expense" | "default";
}) {
  return (
    <div className="rounded-none border border-border bg-muted/30 px-2.5 py-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wide">
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p
        className={cn(
          "font-heading text-sm font-semibold mt-1 truncate",
          tone === "income" && "text-primary",
          tone === "expense" && "text-orange-700 dark:text-orange-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function EmptyHint({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center border border-dashed border-border bg-muted/20">
      <span className="inline-flex size-9 items-center justify-center rounded-none bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <p className="text-xs text-muted-foreground max-w-56">{text}</p>
    </div>
  );
}

export function BigStat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent: OverviewAccent;
}) {
  const styles = overviewAccentStyles[accent];
  return (
    <div className="flex items-end gap-3">
      <p className="font-heading text-4xl font-bold tracking-tight leading-none">
        {value}
      </p>
      <p
        className={cn(
          "text-xs font-medium border px-2 py-1 mb-0.5 rounded-none",
          styles.badge
        )}
      >
        {label}
      </p>
    </div>
  );
}
