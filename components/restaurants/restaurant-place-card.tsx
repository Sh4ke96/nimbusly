"use client";

import { RESTAURANT_FORM_FIELD } from "@/lib/restaurants/types";
import { format } from "date-fns";
import { Beer, Calendar, MapPin, Pencil, Trash2, Utensils } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderActionButton,
  CardHeaderActions,
  CardTitle,
  CARD_TITLE_ROW_CLASSNAME,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RestaurantMapPreview } from "@/components/restaurants/restaurant-map-preview";
import { RestaurantStarRating } from "@/components/restaurants/restaurant-star-rating";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  RESTAURANT_VENUE_TYPE,
  RESTAURANT_VISIT_STATUS,
  RESTAURANT_VISIT_STATUSES,
} from "@/lib/constants/restaurants";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import { parseRestaurantDateString } from "@/lib/restaurants/types";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { deleteRestaurantPlace, setRestaurantVisitStatus } from "@/app/(app)/restaurants/actions";
import { useActionState } from "react";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";

interface RestaurantPlaceCardProps {
  place: RestaurantPlace;
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onEdit?: () => void;
  onChanged?: () => void;
}

const visitStatusStyles: Record<RestaurantPlace["visit_status"], string> = {
  [RESTAURANT_VISIT_STATUS.PLANNED]:
    "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20",
  [RESTAURANT_VISIT_STATUS.VISITED]:
    "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
};

function resolveCreatorName(
  createdBy: string,
  userId: string | undefined,
  profile: Profile | null,
  members: FamilyMember[]
): string | null {
  if (!userId) return null;
  if (createdBy === userId && profile) return getDisplayName(profile);
  const member = members.find((m) => m.id === createdBy);
  return member ? getDisplayName(member) : null;
}

export function RestaurantPlaceCard({
  place,
  profile,
  members,
  userId,
  onEdit,
  onChanged,
}: RestaurantPlaceCardProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = place.created_by === userId;
  const creator = resolveCreatorName(place.created_by, userId, profile, members);
  const VenueIcon =
    place.venue_type === RESTAURANT_VENUE_TYPE.PUB ? Beer : Utensils;

  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteRestaurantPlace,
    null
  );
  const [statusState, statusAction, statusPending] = useActionState(
    setRestaurantVisitStatus,
    null
  );

  useActionFeedback(deleteState, () => {
    onChanged?.();
  }, deletePending);

  useActionFeedback(statusState, () => {
    onChanged?.();
  });

  const visitedLabel = place.visited_at
    ? format(parseRestaurantDateString(place.visited_at) ?? new Date(), "d MMM yyyy", {
        locale,
      })
    : null;

  return (
    <Card className="rounded-none py-0 shadow-sm transition-all duration-150 hover:shadow-md sm:col-span-2">
      <CardHeader>
        <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "truncate")}>{place.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <VenueIcon className="size-3 shrink-0" />
          {t.restaurants.venueTypeLabels[place.venue_type]}
        </CardDescription>
        {isOwner && (
          <CardHeaderActions>
            <CardHeaderActionButton onClick={onEdit} aria-label={t.restaurants.editBtn}>
              <Pencil className="size-4" />
            </CardHeaderActionButton>
            <form action={deleteAction} className="border-l border-border">
              <input type="hidden" name={RESTAURANT_FORM_FIELD.ID} value={place.id} />
              <CardHeaderActionButton type="submit" destructive disabled={deletePending} aria-label={t.restaurants.deleteBtn}>
                <Trash2 className="size-4" />
              </CardHeaderActionButton>
            </form>
          </CardHeaderActions>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-none border px-2 py-0.5 text-[11px] font-medium",
              visitStatusStyles[place.visit_status]
            )}
          >
            {t.restaurants.visitStatusLabels[place.visit_status]}
          </span>
          {place.rating !== null && (
            <RestaurantStarRating value={place.rating} size="sm" />
          )}
        </div>

        {visitedLabel && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            {t.restaurants.visitedAtDisplay}: {visitedLabel}
          </p>
        )}

        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 mt-0.5" />
          <span>{place.address}</span>
        </p>

        <RestaurantMapPreview address={place.address} name={place.name} />

        {place.comment && (
          <div className="border-t border-border pt-3 space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.restaurants.commentLabel}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{place.comment}</p>
          </div>
        )}

        {place.notes && (
          <div className="border-t border-border pt-3 space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.restaurants.notesLabel}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {place.notes}
            </p>
          </div>
        )}

        {isFamily && creator && (
          <p className="text-[11px] text-muted-foreground">
            {t.restaurants.addedBy}: {creator}
          </p>
        )}

        {isOwner && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {RESTAURANT_VISIT_STATUSES.map((status) => (
              <form key={status} action={statusAction}>
                <input type="hidden" name={RESTAURANT_FORM_FIELD.ID} value={place.id} />
                <input type="hidden" name={RESTAURANT_FORM_FIELD.VISIT_STATUS} value={status} />
                <Button
                  type="submit"
                  size="sm"
                  variant={place.visit_status === status ? "default" : "outline"}
                  disabled={statusPending || place.visit_status === status}
                  className="cursor-pointer rounded-none h-7 text-xs"
                >
                  {t.restaurants.visitStatusLabels[status]}
                </Button>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
