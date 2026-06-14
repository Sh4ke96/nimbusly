"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WatchlistEntryForm } from "@/components/watchlist/watchlist-entry-form";
import type { WatchlistItem } from "@/lib/watchlist/types";
import {
  isValidWatchlistMediaType,
  isValidWatchlistStatus,
  isValidWatchlistTitle,
} from "@/lib/watchlist/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateWatchlistItem } from "@/app/(app)/watchlist/actions";
import { toast } from "sonner";

interface WatchlistEditDialogProps {
  item: WatchlistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WatchlistEditDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: WatchlistEditDialogProps) {
  const t = useT();
  const [title, setTitle] = useState<string>("");
  const [mediaType, setMediaType] = useState<WatchlistItem["media_type"] | null>(null);
  const [status, setStatus] = useState<WatchlistItem["status"] | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [state, action, pending] = useActionState(updateWatchlistItem, null);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setMediaType(item.media_type);
    setStatus(item.status);
    setNotes(item.notes);
  }, [item]);

  useActionFeedback(state, () => {
    onOpenChange(false);
    onSuccess();
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isValidWatchlistTitle(title)) {
      e.preventDefault();
      toast.error(t.watchlist.errorTitleRequired);
      return;
    }
    if (!mediaType || !isValidWatchlistMediaType(mediaType)) {
      e.preventDefault();
      toast.error(t.watchlist.errorMediaTypeRequired);
      return;
    }
    if (!status || !isValidWatchlistStatus(status)) {
      e.preventDefault();
      toast.error(t.watchlist.errorStatusRequired);
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.watchlist.editTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" name="id" value={item.id} />
          <WatchlistEntryForm
            title={title}
            onTitleChange={setTitle}
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            status={status}
            onStatusChange={setStatus}
            notes={notes}
            onNotesChange={setNotes}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t.watchlist.saving : t.watchlist.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
