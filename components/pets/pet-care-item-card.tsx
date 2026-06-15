"use client";

import { PET_FORM_FIELD } from "@/lib/pets/types";
import { format } from "date-fns";
import { useActionState } from "react";
import { AlertTriangle, Calendar, Package, PawPrint, Pencil, Trash2 } from "lucide-react";
import { PetDueBadge } from "@/components/pets/pet-due-badge";
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
import { PET_STOCK_STATUS } from "@/lib/constants/pets";
import type { PetCareItem } from "@/lib/pets/types";
import { isPetCareStockType, parsePetDateString } from "@/lib/pets/types";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { deletePetCareItem } from "@/app/(app)/pets/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";

interface PetCareItemCardProps {
  item: PetCareItem;
  petName: string;
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onEdit?: () => void;
  onDeleted?: () => void;
}

const stockStatusStyles: Record<
  NonNullable<PetCareItem["stock_status"]>,
  string
> = {
  [PET_STOCK_STATUS.IN_STOCK]: "bg-primary/10 text-primary border-primary/20",
  [PET_STOCK_STATUS.LOW]: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
  [PET_STOCK_STATUS.OUT_OF_STOCK]: "bg-muted text-muted-foreground border-border",
  [PET_STOCK_STATUS.TO_BUY]: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20",
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

function formatDateLabel(
  value: string | null,
  locale: ReturnType<typeof getDateFnsLocale>
): string | null {
  if (!value) return null;
  const parsed = parsePetDateString(value);
  if (!parsed) return null;
  return format(parsed, "d MMM yyyy", { locale });
}

export function PetCareItemCard({
  item,
  petName,
  profile,
  members,
  userId,
  onEdit,
  onDeleted,
}: PetCareItemCardProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = item.created_by === userId;
  const creator = resolveCreatorName(item.created_by, userId, profile, members);
  const showStock = isPetCareStockType(item.care_type) && item.stock_status;

  const [deleteState, deleteAction, deletePending] = useActionState(deletePetCareItem, null);

  useActionFeedback(deleteState, () => {
    onDeleted?.();
  });

  const lastDoneLabel = formatDateLabel(item.last_done_at, locale);
  const nextDueLabel = formatDateLabel(item.next_due_date, locale);

  return (
    <Card className="rounded-none py-0 shadow-sm transition-all duration-150 hover:shadow-md">
      <CardHeader>
        <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "truncate")}>{item.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <PawPrint className="size-3 shrink-0" />
          <span className="truncate">{petName}</span>
          <span>·</span>
          <span>{t.pets.careTypeLabels[item.care_type]}</span>
          {item.quantity ? (
            <>
              <span>·</span>
              <span>{item.quantity}</span>
            </>
          ) : null}
        </CardDescription>
        {isOwner && (
          <CardHeaderActions>
            <CardHeaderActionButton onClick={onEdit} aria-label={t.pets.editBtn}>
              <Pencil className="size-4" />
            </CardHeaderActionButton>
            <form action={deleteAction} className="border-l border-border">
              <input type="hidden" name={PET_FORM_FIELD.ID} value={item.id} />
              <CardHeaderActionButton type="submit" destructive disabled={deletePending}>
                <Trash2 className="size-4" />
              </CardHeaderActionButton>
            </form>
          </CardHeaderActions>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {showStock && item.stock_status && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[11px] font-medium",
                stockStatusStyles[item.stock_status]
              )}
            >
              <Package className="size-3" />
              {t.pets.stockStatusLabels[item.stock_status]}
            </span>
          )}
          {item.next_due_date && <PetDueBadge dueDate={item.next_due_date} />}
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {lastDoneLabel && (
            <p className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0" />
              {t.pets.lastDoneDisplay}: {lastDoneLabel}
            </p>
          )}
          {nextDueLabel && (
            <p className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0" />
              {t.pets.nextDueDisplay}: {nextDueLabel}
            </p>
          )}
          {showStock && item.stock_status === PET_STOCK_STATUS.TO_BUY && (
            <p className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              {t.pets.needsPurchaseHint}
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
            {t.pets.addedBy}: {creator}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
