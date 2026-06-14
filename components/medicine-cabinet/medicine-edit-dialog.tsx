"use client";

import { MEDICINE_FORM_FIELD } from "@/lib/medicine/types";
import { useActionState, useState } from "react";
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

function MedicineEditForm({
  item,
  onSuccess,
  onClose,
}: {
  item: MedicineItem;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(() => item.name);
  const [formType, setFormType] = useState<MedicineItem["form_type"] | null>(
    () => item.form_type
  );
  const [quantity, setQuantity] = useState(() => item.quantity);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(() =>
    parseMedicineDateString(item.expiry_date)
  );
  const [availability, setAvailability] = useState<MedicineItem["availability"] | null>(
    () => item.availability
  );
  const [location, setLocation] = useState(() => item.location);
  const [notes, setNotes] = useState(() => item.notes);
  const [state, action, pending] = useActionState(updateMedicineItem, null);

  useActionFeedback(state, () => {
    onClose();
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

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <input type="hidden" name={MEDICINE_FORM_FIELD.ID} value={item.id} />
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
  );
}

export function MedicineEditDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: MedicineEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.medicineCabinet.editTitle}</DialogTitle>
        </DialogHeader>
        {item && (
          <MedicineEditForm
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
