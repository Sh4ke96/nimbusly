"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PetEntryForm } from "@/components/pets/pet-entry-form";
import type { PetSpecies } from "@/lib/constants/pets";
import { isValidPetName, isValidPetSpecies } from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createPet } from "@/app/(app)/pets/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface PetFormDialogProps {
  onSuccess: () => void;
}

export function PetFormDialog({ onSuccess }: PetFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [species, setSpecies] = useState<PetSpecies | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(createPet, null);

  useActionFeedback(state, () => {
    setOpen(false);
    setName("");
    setSpecies(null);
    setNotes("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          {t.pets.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.pets.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
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
