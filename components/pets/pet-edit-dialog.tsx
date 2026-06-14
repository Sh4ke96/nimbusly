"use client";

import { PET_FORM_FIELD } from "@/lib/pets/types";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PetEntryForm } from "@/components/pets/pet-entry-form";
import type { Pet } from "@/lib/pets/types";
import { isValidPetName, isValidPetSpecies } from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updatePet } from "@/app/(app)/pets/actions";
import { toast } from "sonner";

interface PetEditDialogProps {
  pet: Pet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function PetEditForm({
  pet,
  onSuccess,
  onClose,
}: {
  pet: Pet;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(() => pet.name);
  const [species, setSpecies] = useState<Pet["species"] | null>(() => pet.species);
  const [notes, setNotes] = useState(() => pet.notes);
  const [state, action, pending] = useActionState(updatePet, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess();
  }, pending);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isValidPetName(name)) {
      e.preventDefault();
      toast.error(t.pets.errorNameRequired);
      return;
    }
    if (!species || !isValidPetSpecies(species)) {
      e.preventDefault();
      toast.error(t.pets.errorSpeciesRequired);
    }
  }

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <input type="hidden" name={PET_FORM_FIELD.ID} value={pet.id} />
      <PetEntryForm
        name={name}
        onNameChange={setName}
        species={species}
        onSpeciesChange={setSpecies}
        notes={notes}
        onNotesChange={setNotes}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.pets.saving : t.pets.saveBtn}
      </Button>
    </form>
  );
}

export function PetEditDialog({
  pet,
  open,
  onOpenChange,
  onSuccess,
}: PetEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.pets.editTitle}</DialogTitle>
        </DialogHeader>
        {pet && (
          <PetEditForm
            key={pet.id}
            pet={pet}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
