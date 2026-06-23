"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NimbusCharacter, type NimbusMood } from "@/components/nimbus/nimbus-character";
import { NimbusCompanionMenu } from "@/components/nimbus/nimbus-companion-menu";
import { NimbusHintBubble } from "@/components/nimbus/nimbus-hint-bubble";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

export function NimbusCompanion() {
  const t = useT();
  const [hovered, setHovered] = useState<boolean>(false);
  const menuOpen = useNimbusStore((s) => s.menuOpen);
  const hintIndex = useNimbusStore((s) => s.hintIndex);
  const hintMessage = useNimbusStore((s) => s.hintMessage);
  const hintKind = useNimbusStore((s) => s.hintKind);
  const hintAction = useNimbusStore((s) => s.hintAction);
  const npcCalling = useNimbusStore((s) => s.npcCalling);
  const tourActive = useNimbusStore((s) => s.tourActive);
  const setMenuOpen = useNimbusStore((s) => s.setMenuOpen);
  const dismissHint = useNimbusStore((s) => s.dismissHint);

  const mood: NimbusMood =
    npcCalling || hintIndex !== null || hintMessage !== null
      ? "calling"
      : hovered || menuOpen
        ? "hover"
        : "idle";

  const hintText =
    hintMessage ??
    (hintIndex !== null ? (t.companion.hints[hintIndex] ?? t.companion.hints[0]) : null);

  function handleOpenChange(open: boolean) {
    setMenuOpen(open);
    if (open) dismissHint();
  }

  function handleDismissHint(options?: { suppress?: boolean; markChangelogSeen?: boolean }) {
    dismissHint({
      suppressSuggestion:
        options?.suppress && hintAction?.suggestionId ? hintAction.suggestionId : undefined,
      suppressContextKey:
        options?.suppress && hintAction?.contextKey ? hintAction.contextKey : undefined,
      markChangelogSeen: options?.markChangelogSeen ?? hintAction?.changelog,
    });
  }

  if (tourActive) return null;

  return (
    <div className="fixed bottom-10 right-2 z-50 flex flex-col items-end gap-2 sm:right-3">
      {hintText && (
        <NimbusHintBubble
          message={hintText}
          action={hintAction}
          kind={hintKind}
          onDismiss={handleDismissHint}
        />
      )}

      <Popover open={menuOpen} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "nimbus-npc-trigger group relative flex flex-col items-center",
                  "cursor-pointer outline-none",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
                aria-label={t.companion.openMenuAria}
              >
                <span
                  className={cn(
                    "nimbus-npc-ground absolute bottom-0 left-1/2 h-2 w-14 -translate-x-1/2 rounded-full bg-black/15 blur-[2px]",
                    mood === "calling" && "nimbus-npc-ground-calling"
                  )}
                  aria-hidden
                />
                <NimbusCharacter mood={mood} size={76} />
                {(npcCalling || hintText) && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground nimbus-npc-ping">
                    !
                  </span>
                )}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="left" className="rounded-none">
            {t.companion.hoverHint}
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="w-80 rounded-none p-0"
        >
          <NimbusCompanionMenu onClose={() => setMenuOpen(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
