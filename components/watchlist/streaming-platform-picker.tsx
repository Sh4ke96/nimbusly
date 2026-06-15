"use client";

import { StreamingPlatformIcon } from "@/components/watchlist/streaming-platform-icon";
import {
  STREAMING_PLATFORMS,
  type StreamingPlatform,
} from "@/lib/constants/watchlist-streaming";
import { WATCHLIST_FORM_FIELD } from "@/lib/watchlist/types";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { useT } from "@/lib/lang-context";

interface StreamingPlatformPickerProps {
  value: StreamingPlatform[];
  onChange: (platforms: StreamingPlatform[]) => void;
}

export function StreamingPlatformPicker({ value, onChange }: StreamingPlatformPickerProps) {
  const t = useT();
  const selected = new Set(value);

  function toggle(platform: StreamingPlatform) {
    if (selected.has(platform)) {
      onChange(value.filter((entry) => entry !== platform));
      return;
    }
    onChange([...value, platform]);
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{t.watchlist.streamingPlatformsLabel}</p>
      <p className="text-xs text-muted-foreground">{t.watchlist.streamingPlatformsHint}</p>
      <input
        type="hidden"
        name={WATCHLIST_FORM_FIELD.STREAMING_PLATFORMS}
        value={JSON.stringify(value)}
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STREAMING_PLATFORMS.map((platform) => {
          const isSelected = selected.has(platform);
          return (
            <button
              key={platform}
              type="button"
              onClick={() => toggle(platform)}
              className={selectionPickerTileButtonClasses(
                isSelected,
                "flex-col items-center gap-2 px-2 py-3 text-center"
              )}
              aria-pressed={isSelected}
            >
              <StreamingPlatformIcon platform={platform} size="md" />
              <span className="text-[11px] font-medium leading-tight text-foreground">
                {t.watchlist.streamingPlatformLabels[platform]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
