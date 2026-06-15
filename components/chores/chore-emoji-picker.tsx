"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Smile, X } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { CHORE_FORM_FIELD } from "@/lib/chores/types";
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

interface ChoreEmojiPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ChoreEmojiPicker({ value, onChange }: ChoreEmojiPickerProps) {
  const t = useT();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState<boolean>(false);

  function handleEmojiClick(data: EmojiClickData) {
    onChange(data.emoji);
    setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      <Label>{t.chores.iconEmojiLabel}</Label>
      <p className="text-xs text-muted-foreground">{t.chores.iconEmojiHint}</p>
      <input type="hidden" name={CHORE_FORM_FIELD.ICON_EMOJI} value={value ?? ""} />
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
              aria-label={t.chores.iconEmojiPick}
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
          <PopoverContent
            align="start"
            className="w-auto border-0 bg-transparent p-0 shadow-none"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
              width={320}
              height={380}
              searchPlaceholder={t.chores.iconEmojiSearch}
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </PopoverContent>
        </Popover>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer h-8 px-2 text-xs text-muted-foreground"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
            {t.chores.iconEmojiClear}
          </Button>
        )}
      </div>
    </div>
  );
}
