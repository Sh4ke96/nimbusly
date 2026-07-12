"use client";

import { NOTE_CATEGORY_FORM_FIELD } from "@/lib/notes/types";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteNoteCategory } from "@/app/(app)/notes/actions";
import { NoteCategoryEditDialog } from "@/components/notes/note-category-edit-dialog";
import { Button } from "@/components/ui/button";
import type { NoteCategory } from "@/lib/notes/types";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface NoteCategoriesPanelProps {
  categories: NoteCategory[];
  userId: string | undefined;
  onChanged: () => void;
}

function NoteCategoryRow({
  category,
  isOwner,
  onChanged,
}: {
  category: NoteCategory;
  isOwner: boolean;
  onChanged: () => void;
}) {
  const t = useT();
  const [deleteState, deleteAction, deletePending] = useActionState(deleteNoteCategory, null);

  useActionFeedback(deleteState, onChanged);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-none border border-border px-2 py-1 text-xs"
      )}
    >
      <span className="font-medium">
        {category.icon_emoji ? `${category.icon_emoji} ` : ""}
        {category.name}
      </span>
      {isOwner && (
        <>
          <NoteCategoryEditDialog category={category} onSuccess={onChanged} />
          <form action={deleteAction}>
            <input type="hidden" name={NOTE_CATEGORY_FORM_FIELD.ID} value={category.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={deletePending}
              className="size-7 cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label={t.notes.deleteCategoryBtn}
            >
              <Trash2 className="size-3" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

export function NoteCategoriesPanel({
  categories,
  userId,
  onChanged,
}: NoteCategoriesPanelProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <NoteCategoryRow
          key={category.id}
          category={category}
          isOwner={category.created_by === userId}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}
