"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MedicineEntryForm } from "@/components/medicine-cabinet/medicine-entry-form";
import type { MedicineItem } from "@/lib/medicine/types";
import { parseMedicineDateString } from "@/lib/medicine/types";
import {
  isValidMedicineAvailability,
  isValidMedicineFormType,
  isValidMedicineName,
} from "@/lib/medicine/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateMedicineItem } from "@/app/(app)/medicine-cabinet/actions";
import { toast } from "sonner";

interface MedicineEditDialogProps {
  item: MedicineItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MedicineEditDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: MedicineEditDialogProps) {
  const t = useT();
  const [name, setName] = useState<string>("");
  const [formType, setFormType] = useState<MedicineItem["form_type"] | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [availability, setAvailability] = useState<MedicineItem["availability"] | null>(null);
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(updateMedicineItem, null);

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setFormType(item.form_type);
    setQuantity(item.quantity);
    setExpiryDate(parseMedicineDateString(item.expiry_date));
    setAvailability(item.availability);
    setLocation(item.location);
    setNotes(item.notes);
  }, [item]);

  useActionFeedback(state, () => {
    onOpenChange(false);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isValidMedicineName(name)) {
      e.preventDefault();
      toast.error(t.medicineCabinet.errorNameRequired);
      return;
    }
    if (!formType || !isValidMedicineFormType(formType)) {
      e.preventDefault();
      toast.error(t.medicineCabinet.errorFormRequired);
      return;
    }
    if (!availability || !isValidMedicineAvailability(availability)) {
      e.preventDefault();
      toast.error(t.medicineCabinet.errorAvailabilityRequired);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.medicineCabinet.editTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={item.id} />
          <MedicineEntryForm
            name={name}
            onNameChange={setName}
            formType={formType}
            onFormTypeChange={setFormType}
            quantity={quantity}
            onQuantityChange={setQuantity}
            expiryDate={expiryDate}
            onExpiryDateChange={setExpiryDate}
            availability={availability}
            onAvailabilityChange={setAvailability}
            location={location}
            onLocationChange={setLocation}
            notes={notes}
            onNotesChange={setNotes}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.medicineCabinet.saving : t.medicineCabinet.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
