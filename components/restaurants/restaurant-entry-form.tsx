"use client";

import { RESTAURANT_FORM_FIELD } from "@/lib/restaurants/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RestaurantMapPreview } from "@/components/restaurants/restaurant-map-preview";
import { RestaurantStarRating } from "@/components/restaurants/restaurant-star-rating";
import { RestaurantVisitedDatePicker } from "@/components/restaurants/restaurant-visited-date-picker";
import {
  RESTAURANT_VENUE_TYPES,
  RESTAURANT_VISIT_STATUSES,
  RESTAURANT_VISIT_STATUS,
  type RestaurantVenueType,
  type RestaurantVisitStatus,
} from "@/lib/constants/restaurants";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

interface RestaurantEntryFormProps {
  name: string;
  onNameChange: (value: string) => void;
  venueType: RestaurantVenueType | null;
  onVenueTypeChange: (value: RestaurantVenueType) => void;
  visitStatus: RestaurantVisitStatus | null;
  onVisitStatusChange: (value: RestaurantVisitStatus) => void;
  rating: number | null;
  onRatingChange: (value: number) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  visitedAt: Date | undefined;
  onVisitedAtChange: (value: Date | undefined) => void;
}

export function RestaurantEntryForm({
  name,
  onNameChange,
  venueType,
  onVenueTypeChange,
  visitStatus,
  onVisitStatusChange,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  notes,
  onNotesChange,
  address,
  onAddressChange,
  visitedAt,
  onVisitedAtChange,
}: RestaurantEntryFormProps) {
  const t = useT();
  const isVisited = visitStatus === RESTAURANT_VISIT_STATUS.VISITED;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="restaurant-name">{t.restaurants.nameLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.restaurants.nameHint}</p>
        <Input
          id="restaurant-name"
          name={RESTAURANT_FORM_FIELD.NAME}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.restaurants.namePlaceholder}
          className="rounded-none"
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.restaurants.venueTypeLabel}</Label>
        <div className="grid grid-cols-2 gap-2">
          {RESTAURANT_VENUE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onVenueTypeChange(type)}
              className={selectionPickerTileButtonClasses(venueType === type, "px-2 py-2 text-xs")}
            >
              {t.restaurants.venueTypeLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" name={RESTAURANT_FORM_FIELD.VENUE_TYPE} value={venueType ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label>{t.restaurants.visitStatusLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.restaurants.visitStatusHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {RESTAURANT_VISIT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onVisitStatusChange(status)}
              className={selectionPickerTileButtonClasses(visitStatus === status, "px-2 py-2 text-xs")}
            >
              {t.restaurants.visitStatusLabels[status]}
            </button>
          ))}
        </div>
        <input type="hidden" name={RESTAURANT_FORM_FIELD.VISIT_STATUS} value={visitStatus ?? ""} required />
      </div>

      {isVisited && (
        <>
          <div className="space-y-1.5">
            <Label>{t.restaurants.ratingLabel}</Label>
            <p className="text-xs text-muted-foreground">{t.restaurants.ratingHint}</p>
            <RestaurantStarRating value={rating} onChange={onRatingChange} />
          </div>

          <RestaurantVisitedDatePicker
            date={visitedAt}
            onDateChange={onVisitedAtChange}
            required
          />
        </>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="restaurant-address">{t.restaurants.addressLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.restaurants.addressHint}</p>
        <Input
          id="restaurant-address"
          name={RESTAURANT_FORM_FIELD.ADDRESS}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder={t.restaurants.addressPlaceholder}
          className="rounded-none"
          required
          maxLength={300}
        />
      </div>

      {address.trim() && <RestaurantMapPreview address={address} name={name} />}

      <div className="space-y-1.5">
        <Label htmlFor="restaurant-comment">{t.restaurants.commentLabel}</Label>
        <Textarea
          id="restaurant-comment"
          name={RESTAURANT_FORM_FIELD.COMMENT}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={t.restaurants.commentPlaceholder}
          className="rounded-none min-h-20"
          maxLength={500}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="restaurant-notes">{t.restaurants.notesLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.restaurants.notesHint}</p>
        <Textarea
          id="restaurant-notes"
          name={RESTAURANT_FORM_FIELD.NOTES}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t.restaurants.notesPlaceholder}
          className="rounded-none min-h-20"
          maxLength={500}
        />
      </div>
    </div>
  );
}
