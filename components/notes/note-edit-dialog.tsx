"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteEntryForm } from "@/components/notes/note-entry-form";
import { NoteAttachmentsPanel } from "@/components/notes/note-attachments-panel";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  isValidNoteVisibilitySelection,
  noteToVisibilitySelection,
  type NoteVisibilitySelection,
} from "@/components/notes/note-visibility-picker";
import { NOTE_CONTENT_FORMAT } from "@/lib/constants/notes";
import type { Note, NoteCategory } from "@/lib/notes/types";
import type { FamilyMember, Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateNote } from "@/app/(app)/notes/actions";
import { toast } from "sonner";

interface NoteEditDialogProps {
  note: Note | null;
  categories: NoteCategory[];
  profile: Profile | null;
  members: FamilyMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function NoteEditForm({
  note,
  categories,
  profile,
  members,
  onSuccess,
  onClose,
}: {
  note: Note;
  categories: NoteCategory[];
  profile: Profile | null;
  members: FamilyMember[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const [title, setTitle] = useState<string>(() => note.title);
  const [content, setContent] = useState<string>(() => note.content);
  const [categoryId, setCategoryId] = useState<string>(() => note.category_id ?? "");
  const [visibility, setVisibility] = useState<NoteVisibilitySelection>(() =>
    noteToVisibilitySelection(note)
  );
  const [isPinned, setIsPinned] = useState<boolean>(() => note.is_pinned === true);
  const [useMarkdown, setUseMarkdown] = useState<boolean>(
    () => note.content_format === NOTE_CONTENT_FORMAT.MARKDOWN
  );
  const [state, action, pending] = useActionState(updateNote, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!title.trim()) {
      e.preventDefault();
      toast.error(t.notes.errorTitleRequired);
      return;
    }
    if (isFamily && !isValidNoteVisibilitySelection(visibility)) {
      e.preventDefault();
      toast.error(t.notes.errorInvalidVisibility);
    }
  }

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <NoteEntryForm
        id={note.id}
        title={title}
        onTitleChange={setTitle}
        content={content}
        onContentChange={setContent}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        categories={categories}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        isPinned={isPinned}
        onIsPinnedChange={setIsPinned}
        useMarkdown={useMarkdown}
        onUseMarkdownChange={setUseMarkdown}
        profile={profile}
        members={members}
      />
      <NoteAttachmentsPanel key={note.id} noteId={note.id} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.notes.saving : t.notes.saveBtn}
      </Button>
    </form>
  );
}

export function NoteEditDialog({
  note,
  categories,
  profile,
  members,
  open,
  onOpenChange,
  onSuccess,
}: NoteEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.notes.editTitle}</DialogTitle>
        </DialogHeader>
        {note && (
          <NoteEditForm
            key={note.id}
            note={note}
            categories={categories}
            profile={profile}
            members={members}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
