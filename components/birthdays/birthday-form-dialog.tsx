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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BirthdayDatePicker } from "@/components/birthdays/birthday-date-picker";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createBirthday } from "@/app/(app)/birthdays/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface BirthdayFormDialogProps {
  onSuccess: () => void;
}

export function BirthdayFormDialog({ onSuccess }: BirthdayFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [state, action, pending] = useActionState(createBirthday, null);

  useActionFeedback(state, () => {
    setOpen(false);
    setDate(undefined);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!date) {
      e.preventDefault();
      toast.error(t.birthdays.errorDateRequired);
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.birthdays.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.birthdays.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="personName">{t.birthdays.personNameLabel}</Label>
            <Input
              id="personName"
              name="personName"
              required
              placeholder={t.birthdays.personNamePlaceholder}
            />
          </div>

          <BirthdayDatePicker date={date} onDateChange={setDate} />

          <div className="space-y-1.5">
            <Label htmlFor="description">{t.birthdays.descriptionLabel}</Label>
            <Input
              id="description"
              name="description"
              maxLength={120}
              placeholder={t.birthdays.descriptionPlaceholder}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.birthdays.saving : t.birthdays.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
