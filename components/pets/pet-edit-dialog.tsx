"use client";

import { useActionState, useEffect, useState } from "react";
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

export function PetEditDialog({
  pet,
  open,
  onOpenChange,
  onSuccess,
}: PetEditDialogProps) {
  const t = useT();
  const [name, setName] = useState<string>("");
  const [species, setSpecies] = useState<Pet["species"] | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(updatePet, null);

  useEffect(() => {
    if (!pet) return;
    setName(pet.name);
    setSpecies(pet.species);
    setNotes(pet.notes);
  }, [pet]);

  useActionFeedback(state, () => {
    onOpenChange(false);
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

  if (!pet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.pets.editTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={pet.id} />
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
      </DialogContent>
    </Dialog>
  );
}
