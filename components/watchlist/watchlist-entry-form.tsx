"use client";

import { WATCHLIST_FORM_FIELD } from "@/lib/watchlist/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  WATCHLIST_MEDIA_TYPES,
  WATCHLIST_STATUSES,
  type WatchlistMediaType,
  type WatchlistStatus,
} from "@/lib/constants/watchlist";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface WatchlistEntryFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  mediaType: WatchlistMediaType | null;
  onMediaTypeChange: (value: WatchlistMediaType) => void;
  status: WatchlistStatus | null;
  onStatusChange: (value: WatchlistStatus) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function WatchlistEntryForm({
  title,
  onTitleChange,
  mediaType,
  onMediaTypeChange,
  status,
  onStatusChange,
  notes,
  onNotesChange,
}: WatchlistEntryFormProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="watchlist-title">{t.watchlist.titleLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.watchlist.titleHint}</p>
        <Input
          id="watchlist-title"
          name={WATCHLIST_FORM_FIELD.TITLE}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t.watchlist.titlePlaceholder}
          className="rounded-none"
          required
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t.watchlist.mediaTypeLabel}</Label>
        <div className="grid grid-cols-2 gap-2">
          {WATCHLIST_MEDIA_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onMediaTypeChange(type)}
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                mediaType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.watchlist.mediaTypeLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" name={WATCHLIST_FORM_FIELD.MEDIA_TYPE} value={mediaType ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label>{t.watchlist.statusLabel}</Label>
        <p className="text-xs text-muted-foreground">{t.watchlist.statusHint}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {WATCHLIST_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onStatusChange(value)}
              className={cn(
                "cursor-pointer rounded-none border px-2 py-2 text-xs font-medium transition-colors",
                status === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              {t.watchlist.statusLabels[value]}
            </button>
          ))}
        </div>
        <input type="hidden" name={WATCHLIST_FORM_FIELD.STATUS} value={status ?? ""} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="watchlist-notes">{t.watchlist.notesLabel}</Label>
        <Textarea
          id="watchlist-notes"
          name={WATCHLIST_FORM_FIELD.NOTES}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t.watchlist.notesPlaceholder}
          className="rounded-none min-h-20"
          maxLength={500}
        />
      </div>
    </div>
  );
}
