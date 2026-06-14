"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "@/components/member-avatar";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import type { GiftIdea } from "@/lib/gifts/types";
import { resolveGiftRecipientLabel } from "@/lib/gifts/recipients";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { deleteGiftIdea } from "@/app/(app)/gifts/actions";
import { Pencil, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";

interface GiftNoteCardProps {
  idea: GiftIdea;
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDeleted?: () => void;
}

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

export function GiftNoteCard({
  idea,
  profile,
  members,
  userId,
  selected = false,
  onSelect,
  onEdit,
  onDeleted,
}: GiftNoteCardProps) {
  const t = useT();
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = idea.created_by === userId;
  const recipientLabel = resolveGiftRecipientLabel(idea, members);
  const creator = resolveCreatorName(idea.created_by, userId, profile, members);
  const member = idea.recipient_member_id
    ? members.find((m) => m.id === idea.recipient_member_id)
    : null;

  const [deleteState, deleteAction, deletePending] = useActionState(deleteGiftIdea, null);

  useActionFeedback(deleteState, () => {
    onDeleted?.();
  });

  return (
    <Card
      className={cn(
        "rounded-none py-0 shadow-sm transition-all duration-150",
        selected && "ring-2 ring-primary/30 border-primary/40",
        onSelect && "cursor-pointer hover:shadow-md"
      )}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <CardHeader className="border-b border-border pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {member ? (
              <MemberAvatar
                name={recipientLabel}
                color={member.avatar_color}
                size="sm"
              />
            ) : (
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary text-xs font-bold">
                {recipientLabel.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <CardTitle className="font-heading text-base truncate">
                {recipientLabel}
              </CardTitle>
              {idea.recipient_type === GIFT_RECIPIENT_TYPE.CUSTOM && isFamily && (
                <p className="text-[11px] text-muted-foreground">
                  {t.gifts.recipientOutsideFamily}
                </p>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={onEdit}
                aria-label={t.gifts.editBtn}
              >
                <Pencil className="size-4" />
              </Button>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={idea.id} />
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
      <CardContent className="p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {idea.content}
        </p>
        {isFamily && creator && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t.gifts.addedBy}: {creator}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
