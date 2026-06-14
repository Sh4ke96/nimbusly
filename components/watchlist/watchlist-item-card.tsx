"use client";

import { WATCHLIST_FORM_FIELD } from "@/lib/watchlist/types";
import { Film, Pencil, Trash2, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  WATCHLIST_MEDIA_TYPE,
  WATCHLIST_STATUSES,
  WATCHLIST_STATUS,
} from "@/lib/constants/watchlist";
import type { WatchlistItem } from "@/lib/watchlist/types";
import { useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import {
  deleteWatchlistItem,
  setWatchlistItemStatus,
} from "@/app/(app)/watchlist/actions";
import { useActionState } from "react";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";

interface WatchlistItemCardProps {
  item: WatchlistItem;
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onEdit?: () => void;
  onChanged?: () => void;
}

const statusStyles: Record<WatchlistItem["status"], string> = {
  [WATCHLIST_STATUS.TO_WATCH]: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20",
  [WATCHLIST_STATUS.WATCHING]: "bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/20",
  [WATCHLIST_STATUS.WATCHED]: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
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

export function WatchlistItemCard({
  item,
  profile,
  members,
  userId,
  onEdit,
  onChanged,
}: WatchlistItemCardProps) {
  const t = useT();
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = item.created_by === userId;
  const creator = resolveCreatorName(item.created_by, userId, profile, members);
  const MediaIcon = item.media_type === WATCHLIST_MEDIA_TYPE.SERIES ? Tv : Film;

  const [deleteState, deleteAction, deletePending] = useActionState(deleteWatchlistItem, null);
  const [statusState, statusAction, statusPending] = useActionState(setWatchlistItemStatus, null);

  useActionFeedback(deleteState, () => {
    onChanged?.();
  });

  useActionFeedback(statusState, () => {
    onChanged?.();
  });

  return (
    <Card className="rounded-none py-0 shadow-sm transition-all duration-150 hover:shadow-md">
      <CardHeader className="border-b border-border pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="font-heading text-base truncate">{item.title}</CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MediaIcon className="size-3 shrink-0" />
              {t.watchlist.mediaTypeLabels[item.media_type]}
            </p>
          </div>
          {isOwner && (
            <div className="flex shrink-0 gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={onEdit}
                aria-label={t.watchlist.editBtn}
              >
                <Pencil className="size-4" />
              </Button>
              <form action={deleteAction}>
                <input type="hidden" name={WATCHLIST_FORM_FIELD.ID} value={item.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  disabled={deletePending}
                  className="cursor-pointer text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <span
          className={cn(
            "inline-flex items-center rounded-none border px-2 py-0.5 text-[11px] font-medium",
            statusStyles[item.status]
          )}
        >
          {t.watchlist.statusLabels[item.status]}
        </span>

        {item.notes && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground border-t border-border pt-3">
            {item.notes}
          </p>
        )}

        {isOwner && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {WATCHLIST_STATUSES.map((status) => (
              <form key={status} action={statusAction}>
                <input type="hidden" name={WATCHLIST_FORM_FIELD.ID} value={item.id} />
                <input type="hidden" name={WATCHLIST_FORM_FIELD.STATUS} value={status} />
                <Button
                  type="submit"
                  size="sm"
                  variant={item.status === status ? "default" : "outline"}
                  disabled={statusPending || item.status === status}
                  className="cursor-pointer rounded-none h-7 text-xs"
                >
                  {t.watchlist.statusLabels[status]}
                </Button>
              </form>
            ))}
          </div>
        )}

        {isFamily && creator && (
          <p className="text-[11px] text-muted-foreground">
            {t.watchlist.addedBy}: {creator}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
