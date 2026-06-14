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
import { PetCareEntryForm } from "@/components/pets/pet-care-entry-form";
import {
  PET_STOCK_STATUS,
  type PetCareType,
  type PetStockStatus,
} from "@/lib/constants/pets";
import type { Pet } from "@/lib/pets/types";
import {
  dateToPetDateString,
  isPetCareStockType,
  isValidPetCareName,
  isValidPetCareType,
  isValidPetDateString,
  validatePetCareFields,
} from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createPetCareItem } from "@/app/(app)/pets/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface PetCareFormDialogProps {
  pets: Pet[];
  onSuccess: () => void;
}

export function PetCareFormDialog({ pets, onSuccess }: PetCareFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [petId, setPetId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [careType, setCareType] = useState<PetCareType | null>(null);
  const [lastDoneAt, setLastDoneAt] = useState<Date | undefined>();
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>();
  const [stockStatus, setStockStatus] = useState<PetStockStatus | null>(
    PET_STOCK_STATUS.IN_STOCK
  );
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(createPetCareItem, null);

  function resetForm() {
    setPetId("");
    setName("");
    setCareType(null);
    setLastDoneAt(undefined);
    setNextDueDate(undefined);
    setStockStatus(PET_STOCK_STATUS.IN_STOCK);
    setQuantity("");
    setNotes("");
  }

  useActionFeedback(state, () => {
    setOpen(false);
    resetForm();
    onSuccess();
  }, pending);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!petId.trim()) {
      e.preventDefault();
      toast.error(t.pets.errorPetRequired);
      return;
    }
    if (!isValidPetCareName(name)) {
      e.preventDefault();
      toast.error(t.pets.errorCareNameRequired);
      return;
    }
    if (!careType || !isValidPetCareType(careType)) {
      e.preventDefault();
      toast.error(t.pets.errorCareTypeRequired);
      return;
    }
    if (!isValidPetDateString(lastDoneAt ? dateToPetDateString(lastDoneAt) : null)) {
      e.preventDefault();
      toast.error(t.pets.errorInvalidDate);
      return;
    }
    if (!isValidPetDateString(nextDueDate ? dateToPetDateString(nextDueDate) : null)) {
      e.preventDefault();
      toast.error(t.pets.errorInvalidDate);
      return;
    }
    const stockError = validatePetCareFields(
      careType,
      isPetCareStockType(careType) ? stockStatus : null
    );
    if (stockError) {
      e.preventDefault();
      toast.error(t.pets.errorStockStatusRequired);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={pets.length === 0}>
          <Plus className="size-4" />
          {t.pets.addCareBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.pets.addCareTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <PetCareEntryForm
            pets={pets}
            showPetSelect
            petId={petId}
            onPetIdChange={setPetId}
            name={name}
            onNameChange={setName}
            careType={careType}
            onCareTypeChange={setCareType}
            lastDoneAt={lastDoneAt}
            onLastDoneAtChange={setLastDoneAt}
            nextDueDate={nextDueDate}
            onNextDueDateChange={setNextDueDate}
            stockStatus={stockStatus}
            onStockStatusChange={setStockStatus}
            quantity={quantity}
            onQuantityChange={setQuantity}
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
