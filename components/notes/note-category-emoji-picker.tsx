"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Smile, X } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { NOTE_CATEGORY_FORM_FIELD } from "@/lib/notes/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-[320px] items-center justify-center text-xs text-muted-foreground">
      …
    </div>
  ),
});

interface NoteCategoryEmojiPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function NoteCategoryEmojiPicker({ value, onChange }: NoteCategoryEmojiPickerProps) {
  const t = useT();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState<boolean>(false);

  function handleEmojiClick(data: EmojiClickData) {
    onChange(data.emoji);
    setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{t.notes.categoryEmojiLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.notes.categoryEmojiHint}</p>
      <input type="hidden" name={NOTE_CATEGORY_FORM_FIELD.ICON_EMOJI} value={value ?? ""} />
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "cursor-pointer size-11 rounded-none p-0 text-xl",
                value ? "bg-muted/30" : "text-muted-foreground"
              )}
              aria-label={t.notes.categoryEmojiPick}
            >
              {value ? (
                <span className="leading-none" aria-hidden>
                  {value}
                </span>
              ) : (
                <Smile className="size-5" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-none border-0 p-0" align="start">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
              width={320}
              height={360}
              lazyLoadEmojis
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-none text-muted-foreground"
            onClick={() => onChange(null)}
            aria-label={t.notes.categoryEmojiClear}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
