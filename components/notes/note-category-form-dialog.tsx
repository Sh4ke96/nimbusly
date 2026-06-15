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
import { NoteCategoryForm } from "@/components/notes/note-category-form";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createNoteCategory } from "@/app/(app)/notes/actions";
import { FolderPlus } from "lucide-react";
import { toast } from "sonner";

interface NoteCategoryFormDialogProps {
  onSuccess: () => void;
}

export function NoteCategoryFormDialog({ onSuccess }: NoteCategoryFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [iconEmoji, setIconEmoji] = useState<string | null>(null);
  const [state, action, pending] = useActionState(createNoteCategory, null);

  useActionFeedback(state, () => {
    setOpen(false);
    setName("");
    setIconEmoji(null);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!name.trim()) {
      e.preventDefault();
      toast.error(t.notes.errorCategoryName);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <FolderPlus className="size-4" />
          {t.notes.addCategoryBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.notes.addCategoryTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <NoteCategoryForm
            name={name}
            onNameChange={setName}
            iconEmoji={iconEmoji}
            onIconEmojiChange={setIconEmoji}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.notes.saving : t.notes.saveCategoryBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
