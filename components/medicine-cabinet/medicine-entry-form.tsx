"use client";

import { MEDICINE_FORM_FIELD } from "@/lib/medicine/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MedicineDatePicker } from "@/components/medicine-cabinet/medicine-date-picker";
import { MedicineTakenByPicker } from "@/components/medicine-cabinet/medicine-taken-by-picker";
import {
  MEDICINE_AVAILABILITIES,
  MEDICINE_FORM_TYPES,
  type MedicineAvailability,
  type MedicineFormType,
} from "@/lib/constants/medicine";
import type { FamilyMember, Profile } from "@/lib/profile";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

interface MedicineEntryFormProps {
  profile: Profile | null;
  members: FamilyMember[];
  name: string;
  onNameChange: (value: string) => void;
  formType: MedicineFormType | null;
  onFormTypeChange: (value: MedicineFormType) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  expiryDate: Date | undefined;
  onExpiryDateChange: (value: Date | undefined) => void;
  availability: MedicineAvailability | null;
  onAvailabilityChange: (value: MedicineAvailability) => void;
  location: string;
  onLocationChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  takenBy: string | null;
  onTakenByChange: (memberId: string | null) => void;
}

export function MedicineEntryForm({
  profile,
  members,
  name,
  onNameChange,
  formType,
  onFormTypeChange,
  quantity,
  onQuantityChange,
  expiryDate,
  onExpiryDateChange,
  availability,
  onAvailabilityChange,
  location,
  onLocationChange,
  notes,
  onNotesChange,
  takenBy,
  onTakenByChange,
}: MedicineEntryFormProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="medicine-name">{t.medicineCabinet.nameLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.nameHint}</p>
        <Input
          id="medicine-name"
          name={MEDICINE_FORM_FIELD.NAME}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.medicineCabinet.namePlaceholder}
          className="rounded-none"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.medicineCabinet.formLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.formHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MEDICINE_FORM_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onFormTypeChange(type)}
              className={selectionPickerTileButtonClasses(formType === type, "px-2 py-2 text-xs")}
            >
              {t.medicineCabinet.formLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" name={MEDICINE_FORM_FIELD.FORM_TYPE} value={formType ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="medicine-quantity">{t.medicineCabinet.quantityLabel}</Label>
        <Input
          id="medicine-quantity"
          name={MEDICINE_FORM_FIELD.QUANTITY}
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder={t.medicineCabinet.quantityPlaceholder}
          className="rounded-none"
          maxLength={80}
        />
      </div>

      <MedicineDatePicker date={expiryDate} onDateChange={onExpiryDateChange} />

      <MedicineTakenByPicker
        profile={profile}
        members={members}
        takenBy={takenBy}
        onTakenByChange={onTakenByChange}
      />

      <div className="space-y-1.5">
        <Label>{t.medicineCabinet.availabilityLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.availabilityHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {MEDICINE_AVAILABILITIES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onAvailabilityChange(status)}
              className={selectionPickerTileButtonClasses(availability === status, "px-2 py-2 text-xs")}
            >
              {t.medicineCabinet.availabilityLabels[status]}
            </button>
          ))}
        </div>
        <input type="hidden" name={MEDICINE_FORM_FIELD.AVAILABILITY} value={availability ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="medicine-location">{t.medicineCabinet.locationLabel}</Label>
        <Input
          id="medicine-location"
          name={MEDICINE_FORM_FIELD.LOCATION}
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder={t.medicineCabinet.locationPlaceholder}
          className="rounded-none"
          maxLength={80}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="medicine-notes">{t.medicineCabinet.notesLabel}</Label>
        <Textarea
          id="medicine-notes"
          name={MEDICINE_FORM_FIELD.NOTES}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t.medicineCabinet.notesPlaceholder}
          className="rounded-none min-h-20"
          maxLength={500}
        />
      </div>
    </div>
  );
}
