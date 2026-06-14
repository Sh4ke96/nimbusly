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
import { MedicineEntryForm } from "@/components/medicine-cabinet/medicine-entry-form";
import {
  MEDICINE_AVAILABILITY,
  MEDICINE_FORM_TYPE,
  type MedicineAvailability,
  type MedicineFormType,
} from "@/lib/constants/medicine";
import {
  isValidMedicineAvailability,
  isValidMedicineFormType,
  isValidMedicineName,
} from "@/lib/medicine/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createMedicineItem } from "@/app/(app)/medicine-cabinet/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface MedicineFormDialogProps {
  onSuccess: () => void;
}

export function MedicineFormDialog({ onSuccess }: MedicineFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [formType, setFormType] = useState<MedicineFormType | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [availability, setAvailability] = useState<MedicineAvailability | null>(
    MEDICINE_AVAILABILITY.IN_STOCK
  );
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(createMedicineItem, null);

  useActionFeedback(state, () => {
    setOpen(false);
    setName("");
    setFormType(null);
    setQuantity("");
    setExpiryDate(undefined);
    setAvailability(MEDICINE_AVAILABILITY.IN_STOCK);
    setLocation("");
    setNotes("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.medicineCabinet.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.medicineCabinet.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
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
