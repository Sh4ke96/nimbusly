"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MedicineDatePicker } from "@/components/medicine-cabinet/medicine-date-picker";
import {
  MEDICINE_AVAILABILITIES,
  MEDICINE_FORM_TYPES,
  type MedicineAvailability,
  type MedicineFormType,
} from "@/lib/constants/medicine";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface MedicineEntryFormProps {
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
}

export function MedicineEntryForm({
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
}: MedicineEntryFormProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="medicine-name">{t.medicineCabinet.nameLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.nameHint}</p>
        <Input
          id="medicine-name"
          name="name"
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
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                formType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.medicineCabinet.formLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" name="formType" value={formType ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="medicine-quantity">{t.medicineCabinet.quantityLabel}</Label>
        <Input
          id="medicine-quantity"
          name="quantity"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder={t.medicineCabinet.quantityPlaceholder}
          className="rounded-none"
          maxLength={80}
        />
      </div>

      <MedicineDatePicker date={expiryDate} onDateChange={onExpiryDateChange} />

      <div className="space-y-1.5">
        <Label>{t.medicineCabinet.availabilityLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.medicineCabinet.availabilityHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {MEDICINE_AVAILABILITIES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onAvailabilityChange(status)}
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                availability === status
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.medicineCabinet.availabilityLabels[status]}
            </button>
          ))}
        </div>
        <input type="hidden" name="availability" value={availability ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="medicine-location">{t.medicineCabinet.locationLabel}</Label>
        <Input
          id="medicine-location"
          name="location"
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
          name="notes"
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
