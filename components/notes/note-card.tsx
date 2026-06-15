"use client";

import { useActionState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { NoteCategoryBadge } from "@/components/notes/note-category-badge";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import type { Note, NoteCategory } from "@/lib/notes/types";
import { isNoteVisibleToAllMembers } from "@/lib/notes/visibility";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { Button } from "@/components/ui/button";
import { deleteNote } from "@/app/(app)/notes/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { selectionListRowClasses } from "@/lib/ui/selection-styles";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  categories: NoteCategory[];
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onChanged?: () => void;
}

function resolveCreatorName(
  createdBy: string,
  userId: string | undefined,
  profile: Profile | null,
  members: FamilyMember[]
): string | null {
  if (!userId) return null;
  if (createdBy === userId && profile) return getDisplayName(profile);
  const member = members.find((m) => m.id === createdBy);
  return member ? getDisplayName(member) : null;
}

function resolveVisibleMemberNames(
  memberIds: string[],
  members: FamilyMember[]
): string[] {
  return memberIds
    .map((id) => members.find((member) => member.id === id))
    .filter((member): member is FamilyMember => !!member)
    .map((member) => getDisplayName(member));
}

export function NoteCard({
  note,
  categories,
  profile,
  members,
  userId,
  isSelected = false,
  onSelect,
  onEdit,
  onChanged,
}: NoteCardProps) {
  const t = useT();
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = note.created_by === userId;
  const creator = resolveCreatorName(note.created_by, userId, profile, members);
  const visibleMemberNames = resolveVisibleMemberNames(note.visible_to_member_ids, members);

  const [deleteState, deleteAction, deletePending] = useActionState(deleteNote, null);
  useActionFeedback(deleteState, () => onChanged?.(), deletePending);

  return (
    <li className="flex items-start gap-2 p-3 transition-colors">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "min-w-0 flex-1 cursor-pointer rounded-sm border-l-2 text-left transition-all duration-150",
          "hover:bg-muted/60 -my-1 py-2 pl-3 pr-2",
          selectionListRowClasses(isSelected)
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <NoteCategoryBadge
            categoryId={note.category_id}
            categories={categories}
            uncategorizedLabel={t.notes.uncategorizedLabel}
          />
          <span className="text-sm font-medium leading-snug">{note.title}</span>
        </div>
        {note.content.trim() && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
            {note.content}
          </p>
        )}
        <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
          {isFamily && !isNoteVisibleToAllMembers(note.visible_to_member_ids) && (
            <p>
              {t.notes.visibleTo}: {visibleMemberNames.join(", ")}
            </p>
          )}
          {isFamily && creator && (
            <p>
              {t.notes.addedBy}: {creator}
            </p>
          )}
        </div>
      </button>
      {isOwner && (
        <div className="flex shrink-0 gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={onEdit}
            aria-label={t.notes.editBtn}
          >
            <Pencil className="size-4" />
          </Button>
          <form action={deleteAction} onClick={(e) => e.stopPropagation()}>
            <input type="hidden" name={NOTE_FORM_FIELD.ID} value={note.id} />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              disabled={deletePending}
              className="cursor-pointer text-destructive hover:text-destructive"
              aria-label={t.notes.deleteBtn}
            >
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </li>
  );
}
