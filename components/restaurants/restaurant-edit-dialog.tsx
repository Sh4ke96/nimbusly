"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RestaurantEntryForm } from "@/components/restaurants/restaurant-entry-form";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import {
  isValidRestaurantAddress,
  isValidRestaurantName,
  isValidRestaurantRating,
  isValidRestaurantVenueType,
  isValidRestaurantVisitStatus,
  parseRestaurantDateString,
} from "@/lib/restaurants/types";
import { RESTAURANT_VISIT_STATUS } from "@/lib/constants/restaurants";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateRestaurantPlace } from "@/app/(app)/restaurants/actions";
import { toast } from "sonner";

interface RestaurantEditDialogProps {
  place: RestaurantPlace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RestaurantEditDialog({
  place,
  open,
  onOpenChange,
  onSuccess,
}: RestaurantEditDialogProps) {
  const t = useT();
  const [name, setName] = useState<string>("");
  const [venueType, setVenueType] = useState<RestaurantPlace["venue_type"] | null>(null);
  const [visitStatus, setVisitStatus] = useState<RestaurantPlace["visit_status"] | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [visitedAt, setVisitedAt] = useState<Date | undefined>();
  const [state, action, pending] = useActionState(updateRestaurantPlace, null);

  useEffect(() => {
    if (!place) return;
    setName(place.name);
    setVenueType(place.venue_type);
    setVisitStatus(place.visit_status);
    setRating(place.rating);
    setComment(place.comment);
    setNotes(place.notes);
    setAddress(place.address);
    setVisitedAt(parseRestaurantDateString(place.visited_at));
  }, [place]);

  useActionFeedback(state, () => {
    onOpenChange(false);
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

  if (!place) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.restaurants.editTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={place.id} />
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
