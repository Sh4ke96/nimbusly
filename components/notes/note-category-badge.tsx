"use client";

import type { NoteCategory } from "@/lib/notes/types";
import { noteCategoryChipClass } from "@/lib/notes/category-styles";
import { cn } from "@/lib/utils";

interface NoteCategoryBadgeProps {
  categoryId: string | null;
  categories: NoteCategory[];
  uncategorizedLabel: string;
  selected?: boolean;
  className?: string;
}

export function NoteCategoryBadge({
  categoryId,
  categories,
  uncategorizedLabel,
  selected = false,
  className,
}: NoteCategoryBadgeProps) {
  const category = categoryId ? categories.find((item) => item.id === categoryId) : null;
  const name = category?.name ?? uncategorizedLabel;
  const emoji = category?.icon_emoji ?? null;

  return (
    <span className={cn(noteCategoryChipClass(selected), className)}>
      {emoji && (
        <span className="shrink-0 text-xs leading-none" aria-hidden>
          {emoji}
        </span>
      )}
      <span className="min-w-0 truncate">{name}</span>
    </span>
  );
}
