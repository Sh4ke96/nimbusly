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
  type MedicineAvailability,
  type MedicineFormType,
} from "@/lib/constants/medicine";
import {
  isValidMedicineAvailability,
  isValidMedicineFormType,
  isValidMedicineName,
} from "@/lib/medicine/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createMedicineItem } from "@/app/(app)/medicine-cabinet/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface MedicineFormDialogProps {
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MedicineFormDialog({
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: MedicineFormDialogProps) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const isControlled = onOpenChange !== undefined;
  const open = isControlled ? (controlledOpen ?? false) : internalOpen;
  const [name, setName] = useState<string>("");
  const [formType, setFormType] = useState<MedicineFormType | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [availability, setAvailability] = useState<MedicineAvailability | null>(
    MEDICINE_AVAILABILITY.IN_STOCK
  );
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [takenBy, setTakenBy] = useState<string | null>(null);
  const [state, action, pending] = useActionState(createMedicineItem, null);

  function resetForm() {
    setName("");
    setFormType(null);
    setQuantity("");
    setExpiryDate(undefined);
    setAvailability(MEDICINE_AVAILABILITY.IN_STOCK);
    setLocation("");
    setNotes("");
    setTakenBy(null);
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
    handleOpenChange(false);
    onSuccess();
  }, pending);

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            profile={profile}
            members={members}
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
            takenBy={takenBy}
            onTakenByChange={setTakenBy}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.medicineCabinet.saving : t.medicineCabinet.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
