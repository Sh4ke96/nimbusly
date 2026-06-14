"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { EyeOff, GripVertical, ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

export type OverviewAccent =
  | "primary"
  | "orange"
  | "violet"
  | "indigo"
  | "amber"
  | "rose"
  | "sky"
  | "slate"
  | "emerald";

export const overviewAccentStyles: Record<
  OverviewAccent,
  { icon: string; badge: string; ring: string }
> = {
  primary: {
    icon: "bg-primary/12 text-primary",
    badge: "bg-primary/8 text-primary border-primary/20",
    ring: "hover:border-primary/30",
  },
  orange: {
    icon: "bg-orange-500/12 text-orange-700 dark:text-orange-400",
    badge: "bg-orange-500/8 text-orange-800 dark:text-orange-300 border-orange-500/20",
    ring: "hover:border-orange-500/30",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
    badge: "bg-violet-500/8 text-violet-800 dark:text-violet-300 border-violet-500/20",
    ring: "hover:border-violet-500/30",
  },
  indigo: {
    icon: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
    badge: "bg-indigo-500/8 text-indigo-800 dark:text-indigo-300 border-indigo-500/20",
    ring: "hover:border-indigo-500/30",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
    badge: "bg-amber-500/8 text-amber-800 dark:text-amber-300 border-amber-500/20",
    ring: "hover:border-amber-500/30",
  },
  rose: {
    icon: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
    badge: "bg-rose-500/8 text-rose-800 dark:text-rose-300 border-rose-500/20",
    ring: "hover:border-rose-500/30",
  },
  sky: {
    icon: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
    badge: "bg-sky-500/8 text-sky-800 dark:text-sky-300 border-sky-500/20",
    ring: "hover:border-sky-500/30",
  },
  slate: {
    icon: "bg-muted text-muted-foreground",
    badge: "bg-muted/80 text-foreground border-border",
    ring: "hover:border-border",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500/8 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
    ring: "hover:border-emerald-500/30",
  },
};

interface SortableOverviewCardProps {
  cardId: DashboardOverviewCardId;
  href: string;
  title: string;
  icon: LucideIcon;
  accent?: OverviewAccent;
  className?: string;
  editMode: boolean;
  onHide: () => void;
  children: React.ReactNode;
}

export function SortableOverviewCard({
  cardId,
  href,
  title,
  icon: Icon,
  accent = "primary",
  className,
  editMode,
  onHide,
  children,
}: SortableOverviewCardProps) {
  const t = useT();
  const styles = overviewAccentStyles[accent];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardId,
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        isDragging && "z-20 opacity-90",
        editMode && "ring-1 ring-dashed ring-primary/25"
      )}
    >
      <Card
        className={cn(
          "group rounded-none py-0 shadow-sm transition-all duration-200 h-full",
          !editMode && "hover:-translate-y-0.5 hover:shadow-md",
          styles.ring
        )}
      >
        <CardHeader className="border-b border-border pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {editMode && (
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-none border border-border bg-muted/40 text-muted-foreground active:cursor-grabbing"
                  aria-label={t.dashboard.overviewDragHandleLabel}
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="size-4" />
                </button>
              )}
              <span
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-none transition-transform duration-200",
                  !editMode && "group-hover:scale-105",
                  styles.icon
                )}
              >
                <Icon className="size-5" />
              </span>
              <CardTitle className="font-heading text-sm leading-tight pt-0.5">
                {title}
              </CardTitle>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {editMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={onHide}
                  aria-label={t.dashboard.hideOverviewCardBtn}
                >
                  <EyeOff className="size-4" />
                </Button>
              )}
              {!editMode && (
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline pt-1"
                >
                  {t.dashboard.viewModule}
                  <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </div>
  );
}
