"use client";

import { PET_FORM_FIELD } from "@/lib/pets/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PET_SPECIES_LIST, type PetSpecies } from "@/lib/constants/pets";
import { PET_NAME_MAX_LENGTH, PET_NOTES_MAX_LENGTH } from "@/lib/constants/pets";
import { useT } from "@/lib/lang-context";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";

interface PetEntryFormProps {
  name: string;
  onNameChange: (value: string) => void;
  species: PetSpecies | null;
  onSpeciesChange: (value: PetSpecies) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function PetEntryForm({
  name,
  onNameChange,
  species,
  onSpeciesChange,
  notes,
  onNotesChange,
}: PetEntryFormProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pet-name">{t.pets.nameLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.pets.nameHint}</p>
        <Input
          id="pet-name"
          name={PET_FORM_FIELD.NAME}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.pets.namePlaceholder}
          className="rounded-none"
          required
          maxLength={PET_NAME_MAX_LENGTH}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.pets.speciesLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.pets.speciesHint}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PET_SPECIES_LIST.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSpeciesChange(type)}
              className={selectionPickerTileButtonClasses(species === type, "justify-center")}
            >
              {t.pets.speciesLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" name={PET_FORM_FIELD.SPECIES} value={species ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pet-notes">{t.pets.notesLabel}</Label>
        <Textarea
          id="pet-notes"
          name={PET_FORM_FIELD.NOTES}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t.pets.notesPlaceholder}
          className="rounded-none min-h-20"
          maxLength={PET_NOTES_MAX_LENGTH}
        />
      </div>
    </div>
  );
}
