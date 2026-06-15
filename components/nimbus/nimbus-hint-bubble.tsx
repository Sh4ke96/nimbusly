"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { useNimbusStore, type NimbusHintAction } from "@/lib/stores/nimbus-store";
import { cn } from "@/lib/utils";

interface NimbusHintBubbleProps {
  message: string;
  action?: NimbusHintAction | null;
  kind?: string | null;
  onDismiss: (options?: { suppress?: boolean }) => void;
}

export function NimbusHintBubble({ message, action, kind, onDismiss }: NimbusHintBubbleProps) {
  const t = useT();
  const startTour = useNimbusStore((s) => s.startTour);
  const router = useRouter();

  const showSuppress = kind === "suggestion" && action?.suggestionId;
  const showTour = !!action?.tourId;
  const showGo = !!action?.href;

  function handleTour() {
    if (!action?.tourId) return;
    onDismiss();
    startTour(action.tourId);
  }

  function handleGo() {
    if (!action?.href) return;
    onDismiss();
    router.push(action.href);
  }

  return (
    <div
      className={cn(
        "relative max-w-[min(18rem,calc(100vw-4rem))] animate-pop",
        "rounded-none border border-primary/40 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm",
        "nimbus-npc-speech"
      )}
      role="status"
    >
      <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        {t.companion.name}
      </p>
      <p className="pr-6 text-sm leading-snug text-foreground">{message}</p>
      {(showTour || showGo || showSuppress) && (
        <div className="mt-2 flex flex-wrap gap-1.5 pr-6">
          {showTour && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 rounded-none px-2 text-xs cursor-pointer"
              onClick={handleTour}
            >
              {t.companion.hintActionTour}
            </Button>
          )}
          {showGo && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 rounded-none px-2 text-xs cursor-pointer"
              onClick={handleGo}
            >
              {t.companion.hintActionGo}
            </Button>
          )}
          {showSuppress && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-none px-2 text-xs text-muted-foreground cursor-pointer"
              onClick={() => onDismiss({ suppress: true })}
            >
              {t.companion.suppressSuggestion}
            </Button>
          )}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 size-6 rounded-none cursor-pointer"
        onClick={() => onDismiss()}
        aria-label={t.companion.closeMenuAria}
      >
        <X className="size-3.5" />
      </Button>
      <span
        className="absolute -bottom-2 right-8 size-3 rotate-45 border-r border-b border-primary/40 bg-card/95"
        aria-hidden
      />
    </div>
  );
}
