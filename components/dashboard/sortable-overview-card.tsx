"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { EyeOff, GripVertical, ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CARD_TITLE_ROW_CLASSNAME,
} from "@/components/ui/card";
import type { DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

import type { OverviewAccent } from "@/lib/constants/overview-accent";

export type { OverviewAccent };

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
  const router = useRouter();
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
    transform: CSS.Translate.toString(transform),
    transition,
  };

  function handleCardClick(event: React.MouseEvent<HTMLDivElement>) {
    if (editMode) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select")) return;
    router.push(href);
  }

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
        onClick={handleCardClick}
        className={cn(
          "group rounded-none py-0 shadow-sm transition-all duration-200 h-full",
          !editMode && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
          editMode && "hover:shadow-sm",
          styles.ring
        )}
      >
        <CardHeader className="grid-cols-[1fr_auto]">
          <div className="flex min-w-0 items-center gap-3">
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
            <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "text-sm")}>{title}</CardTitle>
          </div>
          <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-1 self-center">
            {editMode && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer size-8 rounded-none text-muted-foreground hover:text-foreground hover:bg-muted/60"
                onClick={onHide}
                aria-label={t.dashboard.hideOverviewCardBtn}
              >
                <EyeOff className="size-4" />
              </Button>
            )}
            {!editMode && (
              <ArrowRight className="size-4 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </div>
  );
}
