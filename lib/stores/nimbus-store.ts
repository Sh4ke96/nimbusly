import { create } from "zustand";
import { NIMBUS_CALLING_LEAD_MS, type NimbusHintActionLabel } from "@/lib/constants/nimbus";
import { NIMBUS_TOUR_ID, type NimbusTourId } from "@/lib/constants/nimbus-tour";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";
import { clearTourResume, saveTourResume } from "@/lib/nimbus/tour-resume";
import type { NimbusSuggestionId } from "@/lib/nimbus/suggestions";
import { suppressSuggestion } from "@/lib/nimbus/suggestion-suppress";
import { dismissContextHint } from "@/lib/nimbus/hint-frequency";
import { markChangelogSeen } from "@/lib/nimbus/changelog-seen";
import type { NimbusContextHintKey } from "@/lib/nimbus/context-hints";

export type NimbusHintKind =
  | "random"
  | "context"
  | "suggestion"
  | "celebration"
  | "attention"
  | "greeting"
  | "joke"
  | "changelog";

export interface NimbusHintAction {
  tourId?: NimbusTourId;
  href?: string;
  suggestionId?: NimbusSuggestionId;
  contextKey?: string;
  scrollTarget?: string;
  actionLabel?: NimbusHintActionLabel;
  changelog?: boolean;
}

interface NimbusStore {
  menuOpen: boolean;
  menuView: "main" | "faq" | "snooze";
  tourActive: boolean;
  activeTourId: NimbusTourId | null;
  tourStepIndex: number;
  hintIndex: number | null;
  hintMessage: string | null;
  hintKind: NimbusHintKind | null;
  hintAction: NimbusHintAction | null;
  npcCalling: boolean;
  setMenuOpen: (open: boolean) => void;
  setMenuView: (view: "main" | "faq" | "snooze") => void;
  setNpcCalling: (calling: boolean) => void;
  showHint: (index: number) => void;
  showCustomHint: (
    message: string,
    kind?: NimbusHintKind,
    action?: NimbusHintAction
  ) => void;
  announceHint: (index: number) => void;
  announceCustomHint: (
    message: string,
    kind?: NimbusHintKind,
    action?: NimbusHintAction
  ) => void;
  dismissHint: (options?: {
    suppressSuggestion?: NimbusSuggestionId;
    suppressContextKey?: string;
    markChangelogSeen?: boolean;
  }) => void;
  startTour: (tourId?: NimbusTourId, options?: { stepIndex?: number }) => void;
  pauseTour: () => void;
  endTour: (options?: { clearResume?: boolean }) => void;
}

export const useNimbusStore = create<NimbusStore>((set, get) => ({
  menuOpen: false,
  menuView: "main",
  tourActive: false,
  activeTourId: null,
  tourStepIndex: 0,
  hintIndex: null,
  hintMessage: null,
  hintKind: null,
  hintAction: null,
  npcCalling: false,

  setMenuOpen: (open) =>
    set({
      menuOpen: open,
      menuView: open ? get().menuView : "main",
      hintIndex: open ? null : get().hintIndex,
      hintMessage: open ? null : get().hintMessage,
      hintAction: open ? null : get().hintAction,
    }),

  setMenuView: (view) => set({ menuView: view }),

  setNpcCalling: (calling) => set({ npcCalling: calling }),

  showHint: (index) => {
    const { tourActive, menuOpen } = get();
    if (tourActive || menuOpen) return;
    set({
      hintIndex: index,
      hintMessage: null,
      hintKind: "random",
      hintAction: null,
      npcCalling: false,
    });
  },

  showCustomHint: (message, kind = "context", action) => {
    const { tourActive, menuOpen } = get();
    if (tourActive || menuOpen) return;
    set({
      hintIndex: null,
      hintMessage: message,
      hintKind: kind,
      hintAction: action ?? null,
      npcCalling: false,
    });
  },

  announceHint: (index) => {
    const { tourActive, menuOpen } = get();
    if (tourActive || menuOpen) return;
    set({ npcCalling: true, hintIndex: null, hintMessage: null, hintAction: null });
    window.setTimeout(() => {
      const state = get();
      if (state.tourActive || state.menuOpen) {
        set({ npcCalling: false });
        return;
      }
      set({
        npcCalling: false,
        hintIndex: index,
        hintMessage: null,
        hintKind: "random",
        hintAction: null,
      });
    }, NIMBUS_CALLING_LEAD_MS);
  },

  announceCustomHint: (message, kind = "context", action) => {
    const { tourActive, menuOpen } = get();
    if (tourActive || menuOpen) return;
    set({ npcCalling: true, hintIndex: null, hintMessage: null, hintAction: null });
    window.setTimeout(() => {
      const state = get();
      if (state.tourActive || state.menuOpen) {
        set({ npcCalling: false });
        return;
      }
      set({
        npcCalling: false,
        hintIndex: null,
        hintMessage: message,
        hintKind: kind,
        hintAction: action ?? null,
      });
    }, NIMBUS_CALLING_LEAD_MS);
  },

  dismissHint: (options) => {
    if (options?.suppressSuggestion) {
      suppressSuggestion(options.suppressSuggestion);
    }
    if (options?.suppressContextKey) {
      dismissContextHint(options.suppressContextKey as NimbusContextHintKey);
    }
    if (options?.markChangelogSeen) {
      markChangelogSeen();
    }
    set({
      hintIndex: null,
      hintMessage: null,
      hintKind: null,
      hintAction: null,
      npcCalling: false,
    });
  },

  startTour: (tourId = NIMBUS_TOUR_ID.INTRO, options) => {
    const steps = getNimbusTourSteps(tourId);
    if (steps.length === 0) return;

    const requestedIndex = options?.stepIndex ?? 0;
    const stepIndex = Math.min(Math.max(0, requestedIndex), steps.length - 1);
    if (stepIndex === 0) clearTourResume();
    set({
      menuOpen: false,
      menuView: "main",
      tourActive: true,
      activeTourId: tourId,
      tourStepIndex: stepIndex,
      hintIndex: null,
      hintMessage: null,
      hintKind: null,
      hintAction: null,
      npcCalling: false,
    });
  },

  pauseTour: () => {
    const { activeTourId, tourStepIndex, tourActive } = get();
    if (tourActive && activeTourId) {
      saveTourResume({ tourId: activeTourId, stepIndex: tourStepIndex });
    }
    set({
      tourActive: false,
      activeTourId: null,
      tourStepIndex: 0,
    });
  },

  endTour: (options) => {
    if (options?.clearResume !== false) clearTourResume();
    set({
      tourActive: false,
      activeTourId: null,
      tourStepIndex: 0,
    });
  },
}));
