"use client";

import { useActionState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduleEntryForm } from "@/components/schedule/schedule-entry-form";
import type { ScheduleEntryType } from "@/lib/constants/schedule";
import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateScheduleEntry } from "@/app/(app)/schedule/actions";
import type { ScheduleEntry } from "@/lib/schedule/types";
import {
  dateToEntryDateString,
  entryDateToDate,
  getScheduleEntryEndDate,
  isScheduleRangeFull,
  isValidEntryDateRange,
} from "@/lib/schedule/types";
import { SCHEDULE_MAX_ENTRIES_PER_DAY } from "@/lib/constants/schedule";
import { useState } from "react";
import { toast } from "sonner";

interface ScheduleEditDialogProps {
  entry: ScheduleEntry | null;
  entries: ScheduleEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function entryToDateRange(entry: ScheduleEntry): DateRange {
  const from = entryDateToDate(entry.entry_date);
  const end = getScheduleEntryEndDate(entry);
  const to = entryDateToDate(end);
  return { from, to };
}

function ScheduleEditForm({
  entry,
  entries,
  onSuccess,
  onClose,
}: {
  entry: ScheduleEntry;
  entries: ScheduleEntry[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [range, setRange] = useState<DateRange | undefined>(() => entryToDateRange(entry));
  const [entryType, setEntryType] = useState<ScheduleEntryType | "">(() => entry.entry_type);
  const [description, setDescription] = useState<string>(() => entry.description);
  const [state, action, pending] = useActionState(updateScheduleEntry, null);

  useActionFeedback(state, () => {
    onClose();
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

    if (isScheduleRangeFull(entries, entryDate, entryEndDate, entry.id)) {
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
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <ScheduleEntryForm
        id={entry.id}
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
  );
}

export function ScheduleEditDialog({
  entry,
  entries,
  open,
  onOpenChange,
  onSuccess,
}: ScheduleEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.schedule.editTitle}</DialogTitle>
        </DialogHeader>
        {entry && (
          <ScheduleEditForm
            key={entry.id}
            entry={entry}
            entries={entries}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
