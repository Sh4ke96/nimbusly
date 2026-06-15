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
import { WatchlistEntryForm } from "@/components/watchlist/watchlist-entry-form";
import {
  WATCHLIST_STATUS,
  type WatchlistMediaType,
  type WatchlistStatus,
} from "@/lib/constants/watchlist";
import type { StreamingPlatform } from "@/lib/constants/watchlist-streaming";
import {
  isValidWatchlistMediaType,
  isValidWatchlistStatus,
  isValidWatchlistTitle,
} from "@/lib/watchlist/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createWatchlistItem } from "@/app/(app)/watchlist/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface WatchlistFormDialogProps {
  onSuccess: () => void;
}

export function WatchlistFormDialog({ onSuccess }: WatchlistFormDialogProps) {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [mediaType, setMediaType] = useState<WatchlistMediaType | null>(null);
  const [status, setStatus] = useState<WatchlistStatus | null>(WATCHLIST_STATUS.TO_WATCH);
  const [notes, setNotes] = useState<string>("");
  const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);
  const [state, action, pending] = useActionState(createWatchlistItem, null);

  useActionFeedback(state, () => {
    setOpen(false);
    setTitle("");
    setMediaType(null);
    setStatus(WATCHLIST_STATUS.TO_WATCH);
    setNotes("");
    setStreamingPlatforms([]);
    onSuccess();
  }, pending);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t.watchlist.addBtn}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.watchlist.addTitle}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4" onSubmit={onSubmit}>
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
      </DialogContent>
    </Dialog>
  );
}
