"use client";

import { BIRTHDAY_FORM_FIELD } from "@/lib/birthdays/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BirthdayDatePicker } from "@/components/birthdays/birthday-date-picker";
import { useT } from "@/lib/lang-context";

interface BirthdayEntryFormProps {
  id?: string;
  personName: string;
  onPersonNameChange: (value: string) => void;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function BirthdayEntryForm({
  id,
  personName,
  onPersonNameChange,
  date,
  onDateChange,
  description,
  onDescriptionChange,
}: BirthdayEntryFormProps) {
  const t = useT();
  const personNameId = id ? `${id}-personName` : "personName";
  const descriptionId = id ? `${id}-description` : "description";

  return (
    <>
      {id && <input type="hidden" name={BIRTHDAY_FORM_FIELD.ID} value={id} />}

      <div className="space-y-1.5">
        <Label htmlFor={personNameId}>{t.birthdays.personNameLabel}</Label>
        <Input
          id={personNameId}
          name={BIRTHDAY_FORM_FIELD.PERSON_NAME}
          value={personName}
          onChange={(e) => onPersonNameChange(e.target.value)}
          required
          placeholder={t.birthdays.personNamePlaceholder}
        />
      </div>

      <BirthdayDatePicker date={date} onDateChange={onDateChange} />

      <div className="space-y-1.5">
        <Label htmlFor={descriptionId}>{t.birthdays.descriptionLabel}</Label>
        <Input
          id={descriptionId}
          name={BIRTHDAY_FORM_FIELD.DESCRIPTION}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={120}
          placeholder={t.birthdays.descriptionPlaceholder}
        />
      </div>
    </>
  );
}
