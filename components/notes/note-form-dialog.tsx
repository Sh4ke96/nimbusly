"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoteEntryForm } from "@/components/notes/note-entry-form";
import { NoteAttachmentsCreateField } from "@/components/notes/note-attachments-create-field";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  isValidNoteVisibilitySelection,
  type NoteVisibilitySelection,
} from "@/components/notes/note-visibility-picker";
import type { NoteCategory } from "@/lib/notes/types";
import type { FamilyMember, Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { createNote } from "@/app/(app)/notes/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface NoteFormDialogProps {
  categories: NoteCategory[];
  profile: Profile | null;
  members: FamilyMember[];
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NoteFormDialog({
  categories,
  profile,
  members,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: NoteFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = onOpenChange !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [visibility, setVisibility] = useState<NoteVisibilitySelection>({
    visibleToAll: true,
    memberIds: [],
  });
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [useMarkdown, setUseMarkdown] = useState<boolean>(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [state, action, pending] = useActionState(createNote, null);

  function resetForm() {
    setTitle("");
    setContent("");
    setCategoryId("");
    setVisibility({ visibleToAll: true, memberIds: [] });
    setIsPinned(false);
    setUseMarkdown(false);
    setAttachmentFiles([]);
  }

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) resetForm();
  }

  useActionFeedback(state, () => {
    if (title.startsWith("!")) {
      celebrate("firstUrgentNote");
    }
    handleOpenChange(false);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t.notes.errorTitleRequired);
      return;
    }
    if (isFamily && !isValidNoteVisibilitySelection(visibility)) {
      toast.error(t.notes.errorInvalidVisibility);
      return;
    }

    const formData = new FormData(e.currentTarget);
    for (const file of attachmentFiles) {
      formData.append(NOTE_FORM_FIELD.ATTACHMENTS, file);
    }
    action(formData);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.notes.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.notes.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <NoteEntryForm
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
          <NoteAttachmentsCreateField
            files={attachmentFiles}
            onFilesChange={setAttachmentFiles}
            disabled={pending}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.notes.saving : t.notes.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
