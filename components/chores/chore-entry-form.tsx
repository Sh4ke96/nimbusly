"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { ChoreAssigneePicker } from "@/components/chores/chore-assignee-picker";
import { ChoreCustomRecurrenceFields } from "@/components/chores/chore-custom-recurrence-fields";
import { ChoreRecurrenceDurationFields } from "@/components/chores/chore-recurrence-duration-fields";
import { ChoreDatePicker } from "@/components/chores/chore-date-picker";
import { ChoreEmojiPicker } from "@/components/chores/chore-emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHORE_NOTES_MAX_LENGTH,
  CHORE_RECURRENCE,
  CHORE_RECURRENCES,
  CHORE_STATUSES,
  CHORE_TITLE_MAX_LENGTH,
  type ChoreRecurrence,
  type ChoreRecurrenceDuration,
  type ChoreStatus,
} from "@/lib/constants/chores";
import type { FamilyMember, Profile } from "@/lib/profile";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

interface ChoreEntryFormProps {
  id?: string;
  profile: Profile | null;
  members: FamilyMember[];
  title: string;
  onTitleChange: (value: string) => void;
  iconEmoji: string | null;
  onIconEmojiChange: (value: string | null) => void;
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
  recurrenceIntervalDays: number | null;
  onRecurrenceIntervalDaysChange: (value: number | null) => void;
  recurrenceDuration: ChoreRecurrenceDuration | null;
  onRecurrenceDurationChange: (value: ChoreRecurrenceDuration) => void;
}

export function ChoreEntryForm({
  id,
  profile,
  members,
  title,
  onTitleChange,
  iconEmoji,
  onIconEmojiChange,
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
  recurrenceIntervalDays,
  onRecurrenceIntervalDaysChange,
  recurrenceDuration,
  onRecurrenceDurationChange,
}: ChoreEntryFormProps) {
  const t = useT();
  const titleId = id ? `${id}-title` : "chore-title";
  const notesId = id ? `${id}-notes` : "chore-notes";

  return (
    <div className="space-y-4">
      {id && <input type="hidden" name={CHORE_FORM_FIELD.ID} value={id} />}

      <div className="space-y-1.5">
        <Label htmlFor={titleId}>{t.chores.titleLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.titleHint}</p>
        <Input
          id={titleId}
          name={CHORE_FORM_FIELD.TITLE}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t.chores.titlePlaceholder}
          className="rounded-none"
          required
          maxLength={CHORE_TITLE_MAX_LENGTH}
        />
      </div>

      <ChoreEmojiPicker value={iconEmoji} onChange={onIconEmojiChange} />

      <div className="space-y-1.5">
        <Label>{t.chores.statusLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.statusHint}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {CHORE_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onStatusChange(value)}
              className={selectionPickerTileButtonClasses(status === value, "px-2 py-2 text-xs")}
            >
              {t.chores.statusLabels[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name={CHORE_FORM_FIELD.STATUS} value={status ?? ""} required />
      </div>

      <ChoreAssigneePicker
        profile={profile}
        members={members}
        assignedTo={assignedTo}
        onAssigneeChange={onAssigneeChange}
      />

      <ChoreDatePicker date={dueDate} onDateChange={onDueDateChange} recurrence={recurrence} />

      <div className="space-y-1.5">
        <Label>{t.chores.recurrenceLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.chores.recurrenceHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CHORE_RECURRENCES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRecurrenceChange(value)}
              className={selectionPickerTileButtonClasses(recurrence === value, "px-2 py-2 text-xs")}
            >
              {t.chores.recurrenceLabels[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name={CHORE_FORM_FIELD.RECURRENCE} value={recurrence ?? ""} required />
      </div>

      {recurrence === CHORE_RECURRENCE.CUSTOM && (
        <ChoreCustomRecurrenceFields
          intervalDays={recurrenceIntervalDays}
          onIntervalDaysChange={onRecurrenceIntervalDaysChange}
        />
      )}

      {recurrence && recurrence !== CHORE_RECURRENCE.NONE && (
        <ChoreRecurrenceDurationFields
          duration={recurrenceDuration}
          onDurationChange={onRecurrenceDurationChange}
        />
      )}

      <div className="space-y-1.5">
        <Label htmlFor={notesId}>{t.chores.notesLabel}</Label>
        <Textarea
          id={notesId}
          name={CHORE_FORM_FIELD.NOTES}
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
