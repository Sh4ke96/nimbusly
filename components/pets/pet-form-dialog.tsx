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
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { createPet } from "@/app/(app)/pets/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface PetFormDialogProps {
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PetFormDialog({
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: PetFormDialogProps) {
  const t = useT();
  const celebrate = useNimbusCelebration();
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = onOpenChange !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;
  const [name, setName] = useState<string>("");
  const [species, setSpecies] = useState<PetSpecies | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(createPet, null);

  function resetForm() {
    setName("");
    setSpecies(null);
    setNotes("");
  }

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
    if (!next) resetForm();
  }

  useActionFeedback(state, () => {
    celebrate("firstPet");
    handleOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
