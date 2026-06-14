"use client";

import { PET_FORM_FIELD } from "@/lib/pets/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PetDatePicker } from "@/components/pets/pet-date-picker";
import {
  PET_CARE_NAME_MAX_LENGTH,
  PET_CARE_NOTES_MAX_LENGTH,
  PET_CARE_QUANTITY_MAX_LENGTH,
  PET_CARE_TYPES,
  PET_STOCK_STATUSES,
  type PetCareType,
  type PetStockStatus,
} from "@/lib/constants/pets";
import type { Pet } from "@/lib/pets/types";
import { isPetCareStockType } from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface PetCareEntryFormProps {
  pets?: Pet[];
  showPetSelect?: boolean;
  petId: string;
  onPetIdChange?: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  careType: PetCareType | null;
  onCareTypeChange: (value: PetCareType) => void;
  lastDoneAt: Date | undefined;
  onLastDoneAtChange: (value: Date | undefined) => void;
  nextDueDate: Date | undefined;
  onNextDueDateChange: (value: Date | undefined) => void;
  stockStatus: PetStockStatus | null;
  onStockStatusChange: (value: PetStockStatus) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function PetCareEntryForm({
  pets,
  showPetSelect = false,
  petId,
  onPetIdChange,
  name,
  onNameChange,
  careType,
  onCareTypeChange,
  lastDoneAt,
  onLastDoneAtChange,
  nextDueDate,
  onNextDueDateChange,
  stockStatus,
  onStockStatusChange,
  quantity,
  onQuantityChange,
  notes,
  onNotesChange,
}: PetCareEntryFormProps) {
  const t = useT();
  const showStockFields = careType !== null && isPetCareStockType(careType);

  return (
    <div className="space-y-4">
      {showPetSelect && pets && onPetIdChange && (
        <div className="space-y-1.5">
          <Label htmlFor="pet-care-pet">{t.pets.petLabel}</Label>
          <p className="text-xs text-muted-foreground">{t.pets.petHint}</p>
          <select
            id="pet-care-pet"
            name={PET_FORM_FIELD.PET_ID}
            value={petId}
            onChange={(e) => onPetIdChange(e.target.value)}
            required
            className={cn(
              "flex h-9 w-full rounded-none border border-input bg-background px-3 py-1 text-sm shadow-xs",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            )}
          >
            <option value="">{t.pets.petPlaceholder}</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!showPetSelect && <input type="hidden" name={PET_FORM_FIELD.PET_ID} value={petId} />}

      <div className="space-y-1.5">
        <Label htmlFor="pet-care-name">{t.pets.careNameLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.pets.careNameHint}</p>
        <Input
          id="pet-care-name"
          name={PET_FORM_FIELD.NAME}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.pets.careNamePlaceholder}
          className="rounded-none"
          required
          maxLength={PET_CARE_NAME_MAX_LENGTH}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.pets.careTypeLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.pets.careTypeHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PET_CARE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onCareTypeChange(type)}
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                careType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.pets.careTypeLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" name={PET_FORM_FIELD.CARE_TYPE} value={careType ?? ""} required />
      </div>

      <PetDatePicker
        date={lastDoneAt}
        onDateChange={onLastDoneAtChange}
        name={PET_FORM_FIELD.LAST_DONE_AT}
        label={t.pets.lastDoneLabel}
        hint={t.pets.lastDoneHint}
        pickLabel={t.pets.pickLastDoneDate}
      />

      <PetDatePicker
        date={nextDueDate}
        onDateChange={onNextDueDateChange}
        name={PET_FORM_FIELD.NEXT_DUE_DATE}
        label={t.pets.nextDueLabel}
        hint={t.pets.nextDueHint}
        pickLabel={t.pets.pickNextDueDate}
      />

      {showStockFields && (
        <>
          <div className="space-y-1.5">
            <Label>{t.pets.stockStatusLabel}</Label>
            <p className="text-xs text-muted-foreground">{t.pets.stockStatusHint}</p>
            <div className="grid grid-cols-2 gap-2">
              {PET_STOCK_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStockStatusChange(status)}
                  className={cn(
                    "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                    stockStatus === status
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted/50"
                  )}
                >
                  {t.pets.stockStatusLabels[status]}
                </button>
              ))}
            </div>
            <input type="hidden" name={PET_FORM_FIELD.STOCK_STATUS} value={stockStatus ?? ""} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pet-care-quantity">{t.pets.quantityLabel}</Label>
            <Input
              id="pet-care-quantity"
              name={PET_FORM_FIELD.QUANTITY}
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              placeholder={t.pets.quantityPlaceholder}
              className="rounded-none"
              maxLength={PET_CARE_QUANTITY_MAX_LENGTH}
            />
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="pet-care-notes">{t.pets.careNotesLabel}</Label>
        <Textarea
          id="pet-care-notes"
          name={PET_FORM_FIELD.NOTES}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t.pets.careNotesPlaceholder}
          className="rounded-none min-h-20"
          maxLength={PET_CARE_NOTES_MAX_LENGTH}
        />
      </div>
    </div>
  );
}
