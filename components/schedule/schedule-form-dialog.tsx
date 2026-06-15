"use client";

import { useActionState, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScheduleEntryForm } from "@/components/schedule/schedule-entry-form";
import { type ScheduleEntryType, SCHEDULE_MAX_ENTRIES_PER_DAY } from "@/lib/constants/schedule";
import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { createScheduleEntry } from "@/app/(app)/schedule/actions";
import {
  dateToEntryDateString,
  isScheduleRangeFull,
  isValidEntryDateRange,
  type ScheduleEntry,
} from "@/lib/schedule/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface ScheduleFormDialogProps {
  entries: ScheduleEntry[];
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialDate?: Date;
  onTriggerClick?: () => void;
}

export function ScheduleFormDialog({
  entries,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  initialDate,
  onTriggerClick,
}: ScheduleFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = onOpenChange !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;
  const [range, setRange] = useState<DateRange | undefined>();
  const [entryType, setEntryType] = useState<ScheduleEntryType | "">("");
  const [description, setDescription] = useState<string>("");
  const [initialSeed, setInitialSeed] = useState<{ open: boolean; initialTime?: number }>({
    open: false,
  });
  const [state, action, pending] = useActionState(createScheduleEntry, null);

  if (open && initialDate) {
    const initialTime = initialDate.getTime();
    if (!initialSeed.open || initialSeed.initialTime !== initialTime) {
      setInitialSeed({ open: true, initialTime });
      setRange({ from: initialDate, to: initialDate });
    }
  } else if (!open && initialSeed.open) {
    setInitialSeed({ open: false });
  }

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) {
      setRange(undefined);
      setEntryType("");
      setDescription("");
    }
  }

  useActionFeedback(state, () => {
    celebrate("firstScheduleEntry");
    handleOpenChange(false);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!range?.from) {
      e.preventDefault();
      toast.error(t.schedule.errorDateRequired);
      return;
    }
    if (!entryType) {
      e.preventDefault();
      toast.error(t.schedule.errorInvalidType);
      return;
    }

    const entryDate = dateToEntryDateString(range.from);
    const entryEndDate = dateToEntryDateString(range.to ?? range.from);

    if (!isValidEntryDateRange(entryDate, entryEndDate)) {
      e.preventDefault();
      toast.error(t.schedule.errorEndBeforeStart);
      return;
    }

    if (isScheduleRangeFull(entries, entryDate, entryEndDate)) {
      e.preventDefault();
      toast.error(
        formatMessage(t.schedule.errorTooManyPerDay, {
          max: String(SCHEDULE_MAX_ENTRIES_PER_DAY),
        })
      );
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          onClick={() => {
            onTriggerClick?.();
          }}
        >
          <Plus className="size-4" />
          {t.schedule.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.schedule.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <ScheduleEntryForm
            range={range}
            onRangeChange={setRange}
            entryType={entryType}
            onEntryTypeChange={setEntryType}
            description={description}
            onDescriptionChange={setDescription}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.schedule.saving : t.schedule.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
