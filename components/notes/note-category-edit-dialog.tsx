"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoteCategoryForm } from "@/components/notes/note-category-form";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateNoteCategory } from "@/app/(app)/notes/actions";
import type { NoteCategory } from "@/lib/notes/types";
import { toast } from "sonner";

interface NoteCategoryEditDialogProps {
  category: NoteCategory;
  onSuccess: () => void;
}

function NoteCategoryEditForm({
  category,
  onSuccess,
  onClose,
}: NoteCategoryEditDialogProps & { onClose: () => void }) {
  const t = useT();
  const [name, setName] = useState<string>(() => category.name);
  const [iconEmoji, setIconEmoji] = useState<string | null>(() => category.icon_emoji);
  const [state, action, pending] = useActionState(updateNoteCategory, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!name.trim()) {
      e.preventDefault();
      toast.error(t.notes.errorCategoryName);
    }
  }

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <NoteCategoryForm
        id={category.id}
        name={name}
        onNameChange={setName}
        iconEmoji={iconEmoji}
        onIconEmojiChange={setIconEmoji}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.notes.saving : t.notes.saveCategoryBtn}
      </Button>
    </form>
  );
}

export function NoteCategoryEditDialog({ category, onSuccess }: NoteCategoryEditDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label={t.notes.editCategoryBtn}
        >
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.notes.editCategoryTitle}</DialogTitle>
        </DialogHeader>
        <NoteCategoryEditForm
          key={`${category.id}-${open}`}
          category={category}
          onSuccess={onSuccess}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
