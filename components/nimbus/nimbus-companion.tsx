"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NimbusCharacter, type NimbusMood } from "@/components/nimbus/nimbus-character";
import { NimbusCompanionMenu } from "@/components/nimbus/nimbus-companion-menu";
import { NimbusHintBubble } from "@/components/nimbus/nimbus-hint-bubble";
import { NIMBUS_HINT_SURFACE } from "@/lib/constants/nimbus";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";
import { APP_MOBILE_BOTTOM_BAR_CLASS, APP_MOBILE_NIMBUS_HINT_Z, APP_NIMBUS_COMPANION_Z, APP_NIMBUS_POPOVER_Z } from "@/lib/ui/app-layout";
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
    tourActive || npcCalling || hintIndex !== null || hintMessage !== null
      ? "calling"
      : hovered || menuOpen
        ? "hover"
        : "idle";

  const hintText =
    tourActive
      ? null
      : hintMessage ??
      (hintIndex !== null ? (t.companion.hints[hintIndex] ?? t.companion.hints[0]) : null);

  const menuVisible = menuOpen && !tourActive;

  function handleOpenChange(open: boolean) {
    if (tourActive) return;
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

  useEffect(() => {
    if (tourActive && menuOpen) {
      setMenuOpen(false);
    }
  }, [tourActive, menuOpen, setMenuOpen]);

  const [desktopLayout, setDesktopLayout] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktopLayout(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const isMobileLayout = desktopLayout === false;

  const hintBubble = hintText ? (
    <NimbusHintBubble
      message={hintText}
      action={hintAction}
      kind={hintKind}
      surface={isMobileLayout ? NIMBUS_HINT_SURFACE.MOBILE_BAR : NIMBUS_HINT_SURFACE.FLOATING}
      onDismiss={handleDismissHint}
    />
  ) : null;

  return (
    <>
      {hintBubble && isMobileLayout && !menuVisible ? (
        <div
          className={cn(
            "fixed inset-x-0 pointer-events-none md:hidden",
            APP_MOBILE_NIMBUS_HINT_Z,
            "app-nimbus-mobile-hint-anchor"
          )}
        >
          <div className="pointer-events-auto">{hintBubble}</div>
        </div>
      ) : null}

      {desktopLayout !== false ? (
        <div
          className={cn(
            "fixed hidden flex-col gap-2 md:flex",
            tourActive ? "z-10001 nimbus-tour-companion-anchor" : APP_NIMBUS_COMPANION_Z,
            "bottom-10 right-3 items-end"
          )}
        >
          {hintBubble && desktopLayout === true ? (
            <div className="pointer-events-auto w-full max-w-sm">{hintBubble}</div>
          ) : null}

          <Popover
            open={menuVisible && desktopLayout === true}
            onOpenChange={handleOpenChange}
          >
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "nimbus-npc-trigger group relative flex flex-col items-center",
                    "cursor-pointer outline-none pointer-events-auto",
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
                  {(tourActive || npcCalling || hintText) && (
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
            className={cn(APP_NIMBUS_POPOVER_Z, "w-80 rounded-none p-0")}
          >
            <NimbusCompanionMenu onClose={() => setMenuOpen(false)} />
          </PopoverContent>
        </Popover>
        </div>
      ) : null}

      {isMobileLayout ? (
        <Sheet open={menuVisible} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            overlayClassName={cn(
              APP_NIMBUS_POPOVER_Z,
              "bottom-[var(--app-mobile-nav-offset)]"
            )}
            onInteractOutside={(event) => {
              const target = event.target;
              if (
                target instanceof Element &&
                (target.closest("[data-nimbus-mobile-nav-trigger]") ||
                  target.closest(".app-mobile-bottom-nav"))
              ) {
                event.preventDefault();
              }
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
            className={cn(
              APP_NIMBUS_POPOVER_Z,
              APP_MOBILE_BOTTOM_BAR_CLASS,
              "gap-0 rounded-none border-t border-border p-0 shadow-2xl md:hidden",
              "inset-x-0 bottom-[var(--app-mobile-nav-offset)] w-full max-w-none",
              "max-h-[min(88dvh,calc(100dvh-var(--app-mobile-nav-offset)))]",
              "data-open:slide-in-from-bottom data-closed:slide-out-to-bottom"
            )}
          >
            <NimbusCompanionMenu onClose={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : null}
    </>
  );
}
