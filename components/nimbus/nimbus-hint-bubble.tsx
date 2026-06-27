"use client";

import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { useNimbusStore, type NimbusHintAction } from "@/lib/stores/nimbus-store";
import { cn } from "@/lib/utils";

interface NimbusHintBubbleProps {
  message: string;
  action?: NimbusHintAction | null;
  kind?: string | null;
  onDismiss: (options?: { suppress?: boolean; markChangelogSeen?: boolean }) => void;
}

function scrollToTourTarget(target: string) {
  const element = document.querySelector(`[data-nimbus-tour="${target}"]`);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function NimbusHintBubble({ message, action, kind, onDismiss }: NimbusHintBubbleProps) {
  const t = useT();
  const pathname = usePathname();
  const startTour = useNimbusStore((s) => s.startTour);
  const router = useRouter();

  const showSuppressSuggestion = kind === "suggestion" && action?.suggestionId;
  const showSuppressContext = kind === "context" && action?.contextKey;
  const showTour = action?.actionLabel === "tour" || (!!action?.tourId && action?.actionLabel !== "show");
  const showShow = action?.actionLabel === "show" || !!action?.scrollTarget;
  const showGo =
    !!action?.href &&
    action?.actionLabel !== "show" &&
    !action?.scrollTarget;

  function handleTour() {
    if (!action?.tourId) return;
    onDismiss();
    startTour(action.tourId);
  }

  function handleGo() {
    if (!action?.href) return;
    onDismiss(action?.changelog ? { markChangelogSeen: true } : undefined);
    router.push(action.href);
  }

  function handleShow() {
    const target = action?.scrollTarget;
    onDismiss();

    const reveal = () => {
      if (target) scrollToTourTarget(target);
    };

    if (action?.href && pathname !== action.href) {
      router.push(action.href);
      window.setTimeout(reveal, 450);
      return;
    }

    if (pathname !== "/dashboard" && target) {
      router.push("/dashboard");
      window.setTimeout(reveal, 450);
      return;
    }

    reveal();
  }

  return (
    <div
      className={cn(
        "relative w-full max-w-[min(18rem,calc(100vw-1.5rem))] animate-pop",
        "rounded-none border border-primary/40 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm",
        "nimbus-npc-speech"
      )}
      role="status"
    >
      <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
        {t.companion.name}
      </p>
      <p className="pr-6 text-sm leading-snug text-foreground whitespace-pre-line">{message}</p>
      {(showTour || showGo || showShow || showSuppressSuggestion || showSuppressContext) && (
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
          {showShow && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 rounded-none px-2 text-xs cursor-pointer"
              onClick={handleShow}
            >
              {t.companion.hintActionShow}
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
          {showSuppressSuggestion && (
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
          {showSuppressContext && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-none px-2 text-xs text-muted-foreground cursor-pointer"
              onClick={() => onDismiss({ suppress: true })}
            >
              {t.companion.suppressContextHint}
            </Button>
          )}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 size-6 rounded-none cursor-pointer"
        onClick={() => onDismiss(action?.changelog ? { markChangelogSeen: true } : undefined)}
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
