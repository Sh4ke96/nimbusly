"use client";

import { useActionState } from "react";
import { Pencil, StickyNote, Trash2 } from "lucide-react";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import type { Note, NoteCategory } from "@/lib/notes/types";
import { isNoteVisibleToAllMembers } from "@/lib/notes/visibility";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderActionButton,
  CardHeaderActions,
  CardTitle,
  CARD_TITLE_ROW_CLASSNAME,
} from "@/components/ui/card";
import { deleteNote } from "@/app/(app)/notes/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { selectionCardClasses } from "@/lib/ui/selection-styles";
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
  const category = note.category_id
    ? categories.find((item) => item.id === note.category_id)
    : null;
  const categoryEmoji = category?.icon_emoji ?? null;
  const categoryName = category?.name ?? t.notes.uncategorizedLabel;

  const [deleteState, deleteAction, deletePending] = useActionState(deleteNote, null);
  useActionFeedback(deleteState, () => onChanged?.(), deletePending);

  return (
    <Card
      className={cn(
        "rounded-none py-0 shadow-sm transition-all duration-150",
        selectionCardClasses(isSelected),
        onSelect && "cursor-pointer hover:shadow-md"
      )}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect();
            }
          }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <CardHeader>
        <CardTitle className={CARD_TITLE_ROW_CLASSNAME}>
          {categoryEmoji ? (
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-none bg-muted/50 text-2xl leading-none"
              aria-hidden
            >
              {categoryEmoji}
            </span>
          ) : (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
              <StickyNote className="size-4" aria-hidden />
            </span>
          )}
          <span className="min-w-0 flex-1 wrap-break-word">{note.title}</span>
        </CardTitle>
        <CardDescription>{categoryName}</CardDescription>
        {isOwner && (
          <CardHeaderActions onClick={(e) => e.stopPropagation()}>
            <CardHeaderActionButton onClick={onEdit} aria-label={t.notes.editBtn}>
              <Pencil className="size-4" />
            </CardHeaderActionButton>
            <form action={deleteAction} className="border-l border-border">
              <input type="hidden" name={NOTE_FORM_FIELD.ID} value={note.id} />
              <CardHeaderActionButton
                type="submit"
                destructive
                disabled={deletePending}
                aria-label={t.notes.deleteBtn}
              >
                <Trash2 className="size-4" />
              </CardHeaderActionButton>
            </form>
          </CardHeaderActions>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {note.content.trim() && (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap line-clamp-4">
            {note.content}
          </p>
        )}
        <div className="mt-3 space-y-0.5 text-[11px] text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
