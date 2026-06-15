"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GiftEntryForm } from "@/components/gifts/gift-entry-form";
import {
  giftIdeaToRecipientSelection,
  type GiftRecipientSelection,
} from "@/components/gifts/gift-recipient-picker";
import {
  giftIdeaToVisibilitySelection,
  isValidGiftVisibilitySelection,
  type GiftVisibilitySelection,
} from "@/components/gifts/gift-visibility-picker";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import type { GiftIdea } from "@/lib/gifts/types";
import { isValidGiftContent, isValidRecipientName } from "@/lib/gifts/types";
import { isValidGiftLinkUrl, normalizeGiftLinkUrl } from "@/lib/gifts/url";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateGiftIdea } from "@/app/(app)/gifts/actions";
import { toast } from "sonner";

interface GiftEditDialogProps {
  idea: GiftIdea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function GiftEditForm({
  idea,
  onSuccess,
  onClose,
}: {
  idea: GiftIdea;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [recipient, setRecipient] = useState<GiftRecipientSelection>(() =>
    giftIdeaToRecipientSelection(idea)
  );
  const [content, setContent] = useState<string>(() => idea.content);
  const [linkUrl, setLinkUrl] = useState<string>(() => idea.link_url ?? "");
  const [visibility, setVisibility] = useState<GiftVisibilitySelection>(() =>
    giftIdeaToVisibilitySelection(idea)
  );
  const [state, action, pending] = useActionState(updateGiftIdea, null);

  useActionFeedback(state, () => {
    onClose();
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      recipient.type === GIFT_RECIPIENT_TYPE.CUSTOM &&
      !isValidRecipientName(recipient.name)
    ) {
      e.preventDefault();
      toast.error(t.gifts.errorRecipientName);
      return;
    }
    if (!isValidGiftContent(content)) {
      e.preventDefault();
      toast.error(t.gifts.errorContentRequired);
      return;
    }
    const normalizedLink = normalizeGiftLinkUrl(linkUrl);
    if (!isValidGiftLinkUrl(normalizedLink)) {
      e.preventDefault();
      toast.error(t.gifts.errorInvalidLinkUrl);
      return;
    }
    if (!isValidGiftVisibilitySelection(visibility)) {
      e.preventDefault();
      toast.error(t.gifts.errorVisibilityRequired);
    }
  }

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <GiftEntryForm
        id={idea.id}
        profile={profile}
        members={members}
        recipient={recipient}
        onRecipientChange={setRecipient}
        content={content}
        onContentChange={setContent}
        linkUrl={linkUrl}
        onLinkUrlChange={setLinkUrl}
        visibility={visibility}
        onVisibilityChange={setVisibility}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.gifts.saving : t.gifts.saveBtn}
      </Button>
    </form>
  );
}

export function GiftEditDialog({
  idea,
  open,
  onOpenChange,
  onSuccess,
}: GiftEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.gifts.editTitle}</DialogTitle>
        </DialogHeader>
        {idea && (
          <GiftEditForm
            key={idea.id}
            idea={idea}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
