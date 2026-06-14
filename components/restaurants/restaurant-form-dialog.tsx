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
import { RestaurantEntryForm } from "@/components/restaurants/restaurant-entry-form";
import {
  RESTAURANT_VISIT_STATUS,
  type RestaurantVenueType,
  type RestaurantVisitStatus,
} from "@/lib/constants/restaurants";
import {
  isValidRestaurantAddress,
  isValidRestaurantName,
  isValidRestaurantRating,
  isValidRestaurantVenueType,
  isValidRestaurantVisitStatus,
} from "@/lib/restaurants/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createRestaurantPlace } from "@/app/(app)/restaurants/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface RestaurantFormDialogProps {
  onSuccess: () => void;
}

export function RestaurantFormDialog({ onSuccess }: RestaurantFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [venueType, setVenueType] = useState<RestaurantVenueType | null>(null);
  const [visitStatus, setVisitStatus] = useState<RestaurantVisitStatus | null>(
    RESTAURANT_VISIT_STATUS.PLANNED
  );
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [visitedAt, setVisitedAt] = useState<Date | undefined>();
  const [state, action, pending] = useActionState(createRestaurantPlace, null);

  function resetForm() {
    setName("");
    setVenueType(null);
    setVisitStatus(RESTAURANT_VISIT_STATUS.PLANNED);
    setRating(null);
    setComment("");
    setNotes("");
    setAddress("");
    setVisitedAt(undefined);
  }

  useActionFeedback(state, () => {
    setOpen(false);
    resetForm();
    onSuccess();
  }, pending);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isValidRestaurantName(name)) {
      e.preventDefault();
      toast.error(t.restaurants.errorNameRequired);
      return;
    }
    if (!venueType || !isValidRestaurantVenueType(venueType)) {
      e.preventDefault();
      toast.error(t.restaurants.errorVenueTypeRequired);
      return;
    }
    if (!visitStatus || !isValidRestaurantVisitStatus(visitStatus)) {
      e.preventDefault();
      toast.error(t.restaurants.errorVisitStatusRequired);
      return;
    }
    if (!isValidRestaurantAddress(address)) {
      e.preventDefault();
      toast.error(t.restaurants.errorAddressRequired);
      return;
    }
    if (visitStatus === RESTAURANT_VISIT_STATUS.VISITED) {
      if (rating === null || !isValidRestaurantRating(rating)) {
        e.preventDefault();
        toast.error(t.restaurants.errorRatingRequired);
        return;
      }
      if (!visitedAt) {
        e.preventDefault();
        toast.error(t.restaurants.errorVisitedAtRequired);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.restaurants.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.restaurants.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <RestaurantEntryForm
            name={name}
            onNameChange={setName}
            venueType={venueType}
            onVenueTypeChange={setVenueType}
            visitStatus={visitStatus}
            onVisitStatusChange={setVisitStatus}
            rating={rating}
            onRatingChange={setRating}
            comment={comment}
            onCommentChange={setComment}
            notes={notes}
            onNotesChange={setNotes}
            address={address}
            onAddressChange={setAddress}
            visitedAt={visitedAt}
            onVisitedAtChange={setVisitedAt}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.restaurants.saving : t.restaurants.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
