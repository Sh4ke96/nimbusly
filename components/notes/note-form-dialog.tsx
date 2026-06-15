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
}

export function NoteFormDialog({
  categories,
  profile,
  members,
  onSuccess,
}: NoteFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [visibility, setVisibility] = useState<NoteVisibilitySelection>({
    visibleToAll: true,
    memberIds: [],
  });
  const [state, action, pending] = useActionState(createNote, null);

  useActionFeedback(state, () => {
    if (title.startsWith("!")) {
      celebrate("firstUrgentNote");
    }
    setOpen(false);
    setTitle("");
    setContent("");
    setCategoryId("");
    setVisibility({ visibleToAll: true, memberIds: [] });
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
    <Dialog open={open} onOpenChange={setOpen}>
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
            profile={profile}
            members={members}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.notes.saving : t.notes.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
