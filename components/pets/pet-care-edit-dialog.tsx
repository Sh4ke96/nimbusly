"use client";

import { useActionState, useState } from "react";
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

function PetCareEditForm({
  item,
  onSuccess,
  onClose,
}: {
  item: PetCareItem;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [petId, setPetId] = useState(() => item.pet_id);
  const [name, setName] = useState(() => item.name);
  const [careType, setCareType] = useState<PetCareItem["care_type"] | null>(
    () => item.care_type
  );
  const [lastDoneAt, setLastDoneAt] = useState<Date | undefined>(() =>
    parsePetDateString(item.last_done_at)
  );
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(() =>
    parsePetDateString(item.next_due_date)
  );
  const [stockStatus, setStockStatus] = useState<PetCareItem["stock_status"]>(
    () => item.stock_status
  );
  const [quantity, setQuantity] = useState(() => item.quantity);
  const [notes, setNotes] = useState(() => item.notes);
  const [state, action, pending] = useActionState(updatePetCareItem, null);

  useActionFeedback(state, () => {
    onClose();
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

  return (
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
  );
}

export function PetCareEditDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: PetCareEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.pets.editCareTitle}</DialogTitle>
        </DialogHeader>
        {item && (
          <PetCareEditForm
            key={item.id}
            item={item}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
