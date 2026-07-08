"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import { formatBirthdayLabel, type BirthdayEntry, BIRTHDAY_FORM_FIELD } from "@/lib/birthdays/types";
import { selectionListRowClasses } from "@/lib/ui/selection-styles";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

type BirthdaysListProps = {
  entries: BirthdayEntry[];
  loading: boolean;
  loaded: boolean;
  focusedEntryId: string | null;
  userId: string | undefined;
  deleteAction: (formData: FormData) => void;
  deletePending: boolean;
  onFocus: (entry: BirthdayEntry) => void;
  onEdit: (entry: BirthdayEntry) => void;
};

export function BirthdaysList({
  entries,
  loading,
  loaded,
  focusedEntryId,
  userId,
  deleteAction,
  deletePending,
  onFocus,
  onEdit,
}: BirthdaysListProps) {
  const t = useT();

  if (loading && !loaded) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">{t.birthdays.empty}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => {
        const isSelected = focusedEntryId === entry.id;
        const isOwner = entry.created_by === userId;

        return (
          <li key={entry.id} className="flex items-start gap-2 p-3 transition-colors">
            <button
              type="button"
              onClick={() => onFocus(entry)}
              className={cn(
                "min-w-0 flex-1 cursor-pointer rounded-sm border-l-2 text-left transition-all duration-150",
                "hover:bg-muted/60 -my-1 py-2 pl-3 pr-2",
                selectionListRowClasses(isSelected)
              )}
            >
              <p className="font-medium text-sm truncate">{entry.person_name}</p>
              <p className="text-xs text-muted-foreground">{formatBirthdayLabel(entry)}</p>
              {entry.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {entry.description}
                </p>
              )}
            </button>
            {isOwner && (
              <div className="flex shrink-0 gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(entry)}
                  aria-label={t.birthdays.editBtn}
                >
                  <Pencil className="size-4" />
                </Button>
                <form action={deleteAction} onClick={(e) => e.stopPropagation()}>
                  <input type="hidden" name={BIRTHDAY_FORM_FIELD.ID} value={entry.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    disabled={deletePending}
                    className="cursor-pointer text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
