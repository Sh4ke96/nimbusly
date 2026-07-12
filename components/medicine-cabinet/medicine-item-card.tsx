"use client";

import { MEDICINE_FORM_FIELD } from "@/lib/medicine/types";
import { format } from "date-fns";
import { AlertTriangle, Calendar, MapPin, Package, User } from "lucide-react";
import { MedicineExpiryBadge } from "@/components/medicine-cabinet/medicine-expiry-badge";
import { resolveMedicineTakenByName } from "@/components/medicine-cabinet/medicine-taken-by-picker";
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
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { MEDICINE_AVAILABILITY } from "@/lib/constants/medicine";
import type { MedicineItem } from "@/lib/medicine/types";
import { parseMedicineDateString } from "@/lib/medicine/types";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { deleteMedicineItem } from "@/app/(app)/medicine-cabinet/actions";
import { Pencil, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";

interface MedicineItemCardProps {
  item: MedicineItem;
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onEdit?: () => void;
  onDeleted?: () => void;
}

const availabilityStyles: Record<
  MedicineItem["availability"],
  string
> = {
  [MEDICINE_AVAILABILITY.IN_STOCK]: "bg-primary/10 text-primary border-primary/20",
  [MEDICINE_AVAILABILITY.LOW]: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  [MEDICINE_AVAILABILITY.OUT_OF_STOCK]: "bg-muted text-muted-foreground border-border",
  [MEDICINE_AVAILABILITY.TO_BUY]: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20",
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

export function MedicineItemCard({
  item,
  profile,
  members,
  userId,
  onEdit,
  onDeleted,
}: MedicineItemCardProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = item.created_by === userId;
  const canEdit = isOwner || (!!userId && item.taken_by === userId);
  const creator = resolveCreatorName(item.created_by, userId, profile, members);
  const takenByName = resolveMedicineTakenByName(
    item.taken_by,
    profile,
    members,
    t.medicineCabinet.takenByUnassigned
  );

  const [deleteState, deleteAction, deletePending] = useActionState(deleteMedicineItem, null);

  useActionFeedback(deleteState, () => {
    onDeleted?.();
  });

  const expiryLabel = item.expiry_date
    ? format(parseMedicineDateString(item.expiry_date) ?? new Date(), "d MMM yyyy", { locale })
    : null;

  return (
    <Card className="rounded-none py-0 shadow-sm transition-all duration-150 hover:shadow-md">
      <CardHeader>
        <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "truncate")}>{item.name}</CardTitle>
        <CardDescription>
          {t.medicineCabinet.formLabels[item.form_type]}
          {item.quantity ? ` · ${item.quantity}` : ""}
        </CardDescription>
        {canEdit && (
          <CardHeaderActions>
            <CardHeaderActionButton onClick={onEdit} aria-label={t.medicineCabinet.editBtn}>
              <Pencil className="size-4" />
            </CardHeaderActionButton>
            <form action={deleteAction} className="border-l border-border">
              <input type="hidden" name={MEDICINE_FORM_FIELD.ID} value={item.id} />
              <CardHeaderActionButton type="submit" destructive disabled={deletePending} aria-label={t.medicineCabinet.deleteBtn}>
                <Trash2 className="size-4" />
              </CardHeaderActionButton>
            </form>
          </CardHeaderActions>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[11px] font-medium",
              availabilityStyles[item.availability]
            )}
          >
            <Package className="size-3" />
            {t.medicineCabinet.availabilityLabels[item.availability]}
          </span>
          {item.expiry_date && (
            <MedicineExpiryBadge expiryDate={item.expiry_date} />
          )}
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {takenByName && (
            <p className="flex items-center gap-2">
              <User className="size-3.5 shrink-0" />
              {t.medicineCabinet.takenByDisplay}: {takenByName}
            </p>
          )}
          {expiryLabel && (
            <p className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0" />
              {t.medicineCabinet.expiryDisplay}: {expiryLabel}
            </p>
          )}
          {item.location && (
            <p className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              {item.location}
            </p>
          )}
          {item.availability === MEDICINE_AVAILABILITY.TO_BUY && (
            <p className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              {t.medicineCabinet.needsPurchaseHint}
            </p>
          )}
        </div>

        {item.notes && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground border-t border-border pt-3">
            {item.notes}
          </p>
        )}

        {isFamily && creator && (
          <p className="text-[11px] text-muted-foreground">
            {t.medicineCabinet.addedBy}: {creator}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
