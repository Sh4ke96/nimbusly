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
import { GiftEntryForm } from "@/components/gifts/gift-entry-form";
import type { GiftRecipientSelection } from "@/components/gifts/gift-recipient-picker";
import { GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { createGiftIdea } from "@/app/(app)/gifts/actions";
import { isValidGiftContent, isValidRecipientName } from "@/lib/gifts/types";
import { isValidGiftLinkUrl, normalizeGiftLinkUrl } from "@/lib/gifts/url";
import {
  isValidGiftVisibilitySelection,
  type GiftVisibilitySelection,
} from "@/components/gifts/gift-visibility-picker";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface GiftFormDialogProps {
  onSuccess: () => void;
}

export function GiftFormDialog({ onSuccess }: GiftFormDialogProps) {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const [open, setOpen] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<GiftRecipientSelection | null>(null);
  const [content, setContent] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [visibility, setVisibility] = useState<GiftVisibilitySelection>({
    visibleToAll: true,
    memberIds: [],
  });
  const [state, action, pending] = useActionState(createGiftIdea, null);
  const celebrate = useNimbusCelebration();

  useActionFeedback(state, () => {
    celebrate("firstGift");
    setOpen(false);
    setRecipient(null);
    setContent("");
    setLinkUrl("");
    setVisibility({ visibleToAll: true, memberIds: [] });
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!recipient) {
      e.preventDefault();
      toast.error(t.gifts.errorInvalidRecipient);
      return;
    }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.gifts.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.gifts.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <GiftEntryForm
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
      </DialogContent>
    </Dialog>
  );
}
