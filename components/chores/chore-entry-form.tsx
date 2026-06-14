"use client";

import { ChoreAssigneePicker } from "@/components/chores/chore-assignee-picker";
import { ChoreDatePicker } from "@/components/chores/chore-date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHORE_NOTES_MAX_LENGTH,
  CHORE_RECURRENCES,
  CHORE_STATUSES,
  CHORE_TITLE_MAX_LENGTH,
  type ChoreRecurrence,
  type ChoreStatus,
} from "@/lib/constants/chores";
import type { FamilyMember, Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface ChoreEntryFormProps {
  id?: string;
  profile: Profile | null;
  members: FamilyMember[];
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  status: ChoreStatus | null;
  onStatusChange: (value: ChoreStatus) => void;
  assignedTo: string | null;
  onAssigneeChange: (memberId: string | null) => void;
  dueDate: Date | undefined;
  onDueDateChange: (date: Date | undefined) => void;
  recurrence: ChoreRecurrence | null;
  onRecurrenceChange: (value: ChoreRecurrence) => void;
}

export function ChoreEntryForm({
  id,
  profile,
  members,
  title,
  onTitleChange,
  notes,
  onNotesChange,
  status,
  onStatusChange,
  assignedTo,
  onAssigneeChange,
  dueDate,
  onDueDateChange,
  recurrence,
  onRecurrenceChange,
}: ChoreEntryFormProps) {
  const t = useT();
  const titleId = id ? `${id}-title` : "chore-title";
  const notesId = id ? `${id}-notes` : "chore-notes";

  return (
    <div className="space-y-4">
      {id && <input type="hidden" name="id" value={id} />}

      <div className="space-y-1.5">
        <Label htmlFor={titleId}>{t.chores.titleLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.titleHint}</p>
        <Input
          id={titleId}
          name="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t.chores.titlePlaceholder}
          className="rounded-none"
          required
          maxLength={CHORE_TITLE_MAX_LENGTH}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.chores.statusLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.statusHint}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CHORE_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onStatusChange(value)}
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                status === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.chores.statusLabels[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name="status" value={status ?? ""} required />
      </div>

      <ChoreAssigneePicker
        profile={profile}
        members={members}
        assignedTo={assignedTo}
        onAssigneeChange={onAssigneeChange}
      />

      <ChoreDatePicker date={dueDate} onDateChange={onDueDateChange} />

      <div className="space-y-1.5">
        <Label>{t.chores.recurrenceLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.recurrenceHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHORE_RECURRENCES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRecurrenceChange(value)}
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                recurrence === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.chores.recurrenceLabels[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name="recurrence" value={recurrence ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={notesId}>{t.chores.notesLabel}</Label>
        <Textarea
          id={notesId}
          name="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t.chores.notesPlaceholder}
          className="rounded-none min-h-20"
          maxLength={CHORE_NOTES_MAX_LENGTH}
        />
      </div>
    </div>
  );
}
