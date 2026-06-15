"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NimbusTourSpotlight } from "@/components/nimbus/nimbus-tour-spotlight";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";
import {
  resolveNimbusTourStepCopy,
  resolveNimbusTourSummaryCopy,
} from "@/lib/nimbus/tour-copy";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function NimbusTourOverlay() {
  const t = useT();
  const tourActive = useNimbusStore((s) => s.tourActive);
  const activeTourId = useNimbusStore((s) => s.activeTourId);
  const tourStepIndex = useNimbusStore((s) => s.tourStepIndex);
  const tourLayout = useNimbusStore((s) => s.tourLayout);
  const nextTourStep = useNimbusStore((s) => s.nextTourStep);
  const prevTourStep = useNimbusStore((s) => s.prevTourStep);
  const pauseTour = useNimbusStore((s) => s.pauseTour);
  const endTour = useNimbusStore((s) => s.endTour);

  const steps = activeTourId ? getNimbusTourSteps(activeTourId) : [];
  const step = steps[tourStepIndex];
  const isLast = steps.length > 0 && tourStepIndex >= steps.length - 1;
  const isSummary = step?.variant === "summary";
  const { syncing } = tourLayout;

  const goNext = useCallback(() => {
    if (syncing) return;
    if (isLast) {
      endTour({ clearResume: true });
      return;
    }
    nextTourStep();
  }, [syncing, isLast, endTour, nextTourStep]);

  const goPrev = useCallback(() => {
    if (syncing || tourStepIndex === 0) return;
    prevTourStep();
  }, [syncing, tourStepIndex, prevTourStep]);

  useEffect(() => {
    if (!tourActive) return;

    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          goNext();
          break;
        case "Escape":
          event.preventDefault();
          pauseTour();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tourActive, goNext, goPrev, pauseTour]);

  if (!tourActive || !step || !activeTourId) return null;

  const { rect, targetMissing } = tourLayout;
  const copy = resolveNimbusTourStepCopy(t, step.copyKey);
  const summaryCopy = isSummary ? resolveNimbusTourSummaryCopy(t, step.copyKey) : null;
  const title = copy?.title ?? "";
  const body = copy?.body ?? "";
  const progress = steps.length > 0 ? ((tourStepIndex + 1) / steps.length) * 100 : 0;

  return createPortal(
    <div className="nimbus-tour-overlay fixed inset-0 z-[200]">
      {!isSummary && !rect && (
        <div
          className="absolute inset-0 bg-foreground/40 pointer-events-auto"
          onClick={pauseTour}
          aria-hidden
        />
      )}

      {isSummary && (
        <div
          className="absolute inset-0 bg-foreground/50 pointer-events-auto"
          onClick={pauseTour}
          aria-hidden
        />
      )}

      {!isSummary && rect && (
        <NimbusTourSpotlight rect={rect} dimmed={syncing} onDismiss={endTour} />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[201] p-4 pb-6 sm:p-6 sm:pb-8">
        <div
          className={cn(
            "pointer-events-auto mx-auto w-full border border-border bg-card/98 shadow-xl backdrop-blur-sm",
            "nimbus-tour-panel rounded-none",
            isSummary ? "max-w-xl" : "max-w-lg",
            syncing && "nimbus-tour-panel-syncing"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="nimbus-tour-title"
        >
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {isSummary ? t.nimbusTour.summaryBadge : t.nimbusTour.badge} ·{" "}
                  {tourStepIndex + 1}/{steps.length}
                </p>
                <h2
                  id="nimbus-tour-title"
                  key={step.id}
                  className="font-heading text-lg font-semibold text-card-foreground nimbus-tour-step-copy"
                >
                  {title}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-none text-muted-foreground hover:text-foreground"
                onClick={pauseTour}
                aria-label={t.nimbusTour.closeAria}
              >
                <X className="size-4" />
              </Button>
            </div>

            {isSummary && summaryCopy ? (
              <div key={`${step.id}-summary`} className="space-y-4 nimbus-tour-step-copy">
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border border-border bg-muted/30 p-3 space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                      <CheckCircle2 className="size-3.5" />
                      {t.nimbusTour.summaryLearned}
                    </p>
                    <ul className="space-y-1.5 text-sm text-foreground">
                      {summaryCopy.learned.map((item) => (
                        <li key={item} className="flex gap-2 leading-snug">
                          <span className="text-primary shrink-0">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-border bg-muted/30 p-3 space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                      <Sparkles className="size-3.5" />
                      {t.nimbusTour.summaryNext}
                    </p>
                    <ul className="space-y-1.5 text-sm text-foreground">
                      {summaryCopy.next.map((item) => (
                        <li key={item} className="flex gap-2 leading-snug">
                          <span className="text-primary shrink-0">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p
                key={`${step.id}-body`}
                className="text-sm leading-relaxed text-muted-foreground nimbus-tour-step-copy"
              >
                {targetMissing ? t.nimbusTour.targetMissing : body}
              </p>
            )}

            <div
              className="mt-5 flex items-center justify-between gap-2"
              aria-label={t.nimbusTour.keyboardHint}
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto min-h-8 flex-1 justify-between gap-2 rounded-none border-border py-1.5"
                disabled={tourStepIndex === 0 || syncing}
                onClick={goPrev}
              >
                <span className="inline-flex items-center gap-1">
                  <ChevronLeft className="size-4 shrink-0" />
                  {t.nimbusTour.back}
                </span>
                <span className="inline-flex items-center gap-0.5" aria-hidden>
                  <TourKey>A</TourKey>
                  <TourKey>←</TourKey>
                </span>
              </Button>

              <Button
                type="button"
                size="sm"
                className="h-auto min-h-8 flex-1 justify-between gap-2 rounded-none py-1.5"
                disabled={syncing}
                onClick={goNext}
              >
                <span className="inline-flex items-center gap-0.5" aria-hidden>
                  <TourKey>→</TourKey>
                  <TourKey>D</TourKey>
                </span>
                <span className="inline-flex items-center gap-1">
                  {isLast ? t.nimbusTour.finish : t.nimbusTour.next}
                  {!isLast && <ChevronRight className="size-4 shrink-0" />}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function TourKey({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-none border border-current/20 bg-background/50 px-0.5 font-mono text-[9px] font-normal leading-none opacity-65">
      {children}
    </kbd>
  );
}
