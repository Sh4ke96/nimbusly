"use client";

import { WATCHLIST_FORM_FIELD } from "@/lib/watchlist/types";
import { useActionState, useState } from "react";
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

function WatchlistEditForm({
  item,
  onSuccess,
  onClose,
}: {
  item: WatchlistItem;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const [title, setTitle] = useState<string>(() => item.title);
  const [mediaType, setMediaType] = useState<WatchlistItem["media_type"] | null>(
    () => item.media_type
  );
  const [status, setStatus] = useState<WatchlistItem["status"] | null>(() => item.status);
  const [notes, setNotes] = useState<string>(() => item.notes);
  const [streamingPlatforms, setStreamingPlatforms] = useState<WatchlistItem["streaming_platforms"]>(
    () => item.streaming_platforms
  );
  const [state, action, pending] = useActionState(updateWatchlistItem, null);

  useActionFeedback(state, () => {
    onClose();
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

  return (
    <form action={action} className="space-y-4" onSubmit={onSubmit}>
      <input type="hidden" name={WATCHLIST_FORM_FIELD.ID} value={item.id} />
      <WatchlistEntryForm
        title={title}
        onTitleChange={setTitle}
        mediaType={mediaType}
        onMediaTypeChange={setMediaType}
        status={status}
        onStatusChange={setStatus}
        notes={notes}
        onNotesChange={setNotes}
        streamingPlatforms={streamingPlatforms}
        onStreamingPlatformsChange={setStreamingPlatforms}
      />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.watchlist.saving : t.watchlist.saveBtn}
      </Button>
    </form>
  );
}

export function WatchlistEditDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: WatchlistEditDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.watchlist.editTitle}</DialogTitle>
        </DialogHeader>
        {item && (
          <WatchlistEditForm
            key={item.id}
            item={item}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
