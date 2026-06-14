"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PetCareEntryForm } from "@/components/pets/pet-care-entry-form";
import type { PetCareItem } from "@/lib/pets/types";
import {
  dateToPetDateString,
  isPetCareStockType,
  isValidPetCareName,
  isValidPetCareType,
  isValidPetDateString,
  parsePetDateString,
  validatePetCareFields,
} from "@/lib/pets/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updatePetCareItem } from "@/app/(app)/pets/actions";
import { toast } from "sonner";

interface PetCareEditDialogProps {
  item: PetCareItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PetCareEditDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: PetCareEditDialogProps) {
  const t = useT();
  const [petId, setPetId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [careType, setCareType] = useState<PetCareItem["care_type"] | null>(null);
  const [lastDoneAt, setLastDoneAt] = useState<Date | undefined>();
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>();
  const [stockStatus, setStockStatus] = useState<PetCareItem["stock_status"]>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(updatePetCareItem, null);

  useEffect(() => {
    if (!item) return;
    setPetId(item.pet_id);
    setName(item.name);
    setCareType(item.care_type);
    setLastDoneAt(parsePetDateString(item.last_done_at));
    setNextDueDate(parsePetDateString(item.next_due_date));
    setStockStatus(item.stock_status);
    setQuantity(item.quantity);
    setNotes(item.notes);
  }, [item]);

  useActionFeedback(state, () => {
    onOpenChange(false);
    onSuccess();
  }, pending);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    if (!careType) return;
    const stockError = validatePetCareFields(
      careType,
      isPetCareStockType(careType) ? stockStatus : null
    );
    if (stockError) {
      e.preventDefault();
      toast.error(t.pets.errorStockStatusRequired);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.pets.editCareTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={item.id} />
          <PetCareEntryForm
            petId={petId}
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
