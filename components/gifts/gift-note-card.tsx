"use client";

import { GIFT_FORM_FIELD } from "@/lib/gifts/types";
import { MemberAvatar } from "@/components/member-avatar";
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
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import type { GiftIdea } from "@/lib/gifts/types";
import { formatGiftLinkLabel } from "@/lib/gifts/url";
import { isGiftVisibleToAllMembers } from "@/lib/gifts/visibility";
import { resolveGiftRecipientLabel } from "@/lib/gifts/recipients";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { selectionCardClasses } from "@/lib/ui/selection-styles";
import { cn } from "@/lib/utils";
import { deleteGiftIdea } from "@/app/(app)/gifts/actions";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
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
  const visibleMemberNames = idea.visible_to_member_ids
    .map((id) => members.find((m) => m.id === id))
    .filter((entry): entry is FamilyMember => !!entry)
    .map((entry) => getDisplayName(entry));

  const [deleteState, deleteAction, deletePending] = useActionState(deleteGiftIdea, null);

  useActionFeedback(deleteState, () => {
    onDeleted?.();
  });

  return (
    <Card
      className={cn(
        "rounded-none py-0 shadow-sm transition-all duration-150",
        selectionCardClasses(selected),
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
      <CardHeader>
        <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "gap-2")}>
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
          <span className="min-w-0 truncate">{recipientLabel}</span>
        </CardTitle>
        {idea.recipient_type === GIFT_RECIPIENT_TYPE.CUSTOM && isFamily && (
          <CardDescription>{t.gifts.recipientOutsideFamily}</CardDescription>
        )}
        {isOwner && (
          <CardHeaderActions onClick={(e) => e.stopPropagation()}>
            <CardHeaderActionButton onClick={onEdit} aria-label={t.gifts.editBtn}>
              <Pencil className="size-4" />
            </CardHeaderActionButton>
            <form action={deleteAction} className="border-l border-border">
              <input type="hidden" name={GIFT_FORM_FIELD.ID} value={idea.id} />
              <CardHeaderActionButton type="submit" destructive disabled={deletePending}>
                <Trash2 className="size-4" />
              </CardHeaderActionButton>
            </form>
          </CardHeaderActions>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {idea.content}
        </p>
        {idea.link_url && (
          <a
            href={idea.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="size-3.5 shrink-0" />
            {formatGiftLinkLabel(idea.link_url)}
          </a>
        )}
        {isFamily && !isGiftVisibleToAllMembers(idea.visible_to_member_ids) && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t.gifts.visibleTo}: {visibleMemberNames.join(", ")}
          </p>
        )}
        {isFamily && creator && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {t.gifts.addedBy}: {creator}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
