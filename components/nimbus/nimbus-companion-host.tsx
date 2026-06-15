"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NimbusCompanion } from "@/components/nimbus/nimbus-companion";
import { NimbusTourOverlay } from "@/components/nimbus/nimbus-tour-overlay";
import { NimbusTourSync } from "@/components/nimbus/nimbus-tour-sync";
import {
  NIMBUS_CALLING_LEAD_MS,
  NIMBUS_HINT_COUNT,
  NIMBUS_HINT_FIRST_DELAY_MS,
  NIMBUS_HINT_INTERVAL_MS,
  NIMBUS_IDLE_FIDGET_MAX_MS,
  NIMBUS_IDLE_FIDGET_MIN_MS,
} from "@/lib/constants/nimbus";
import { NIMBUS_TOUR_ID, getModuleTourIdForPath } from "@/lib/constants/nimbus-tour";
import { countAttentionFromSnapshot } from "@/lib/nimbus/attention-count";
import { getNimbusContextHintKey } from "@/lib/nimbus/context-hints";
import { detectNimbusSuggestions, type NimbusSuggestionId } from "@/lib/nimbus/suggestions";
import { filterSuppressedSuggestions } from "@/lib/nimbus/suggestion-suppress";
import { NIMBUS_SUGGESTION_HREF } from "@/lib/nimbus/suggestion-links";
import { isFirstModuleVisit, markModuleVisited } from "@/lib/nimbus/first-visit";
import { markIntroTourOffered, shouldOfferIntroTour } from "@/lib/nimbus/onboarding-offer";
import { isNimbusHintsSnoozed } from "@/lib/nimbus/snooze";
import { readSearchStoresSnapshot } from "@/lib/search/search-stores-snapshot";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useT } from "@/lib/lang-context";

const ATTENTION_HINT_KEY = "nimbusly:attention-hint-date";

function randomBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shouldShowAttentionHintToday(): boolean {
  if (typeof window === "undefined") return false;
  const today = new Date().toISOString().slice(0, 10);
  return window.localStorage.getItem(ATTENTION_HINT_KEY) !== today;
}

function markAttentionHintShownToday() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATTENTION_HINT_KEY, new Date().toISOString().slice(0, 10));
}

export function NimbusCompanionHost() {
  const t = useT();
  const pathname = usePathname();
  const loaded = useProfileStore((s) => s.loaded);
  const profile = useProfileStore((s) => s.profile);
  const tourActive = useNimbusStore((s) => s.tourActive);
  const menuOpen = useNimbusStore((s) => s.menuOpen);
  const hintIndex = useNimbusStore((s) => s.hintIndex);
  const hintMessage = useNimbusStore((s) => s.hintMessage);
  const announceHint = useNimbusStore((s) => s.announceHint);
  const announceCustomHint = useNimbusStore((s) => s.announceCustomHint);
  const setNpcCalling = useNimbusStore((s) => s.setNpcCalling);
  const onboardingOffered = useRef(false);

  const enabled = profile?.nimbus_companion_enabled !== false;
  const quiet = profile?.nimbus_companion_quiet === true;
  const visible =
    loaded &&
    !!profile?.onboarding_completed &&
    enabled &&
    pathname !== "/onboarding";

  useEffect(() => {
    if (!visible || quiet || tourActive || menuOpen) return;
    if (!shouldOfferIntroTour() || onboardingOffered.current) return;

    onboardingOffered.current = true;
    const timer = window.setTimeout(() => {
      if (isNimbusHintsSnoozed()) return;
      markIntroTourOffered();
      announceCustomHint(t.companion.onboardingIntroOffer, "context", {
        tourId: NIMBUS_TOUR_ID.INTRO,
      });
    }, 8_000);

    return () => window.clearTimeout(timer);
  }, [visible, quiet, tourActive, menuOpen, announceCustomHint, t]);

  useEffect(() => {
    if (!visible || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;
    if (hintIndex !== null || hintMessage !== null) return;

    const moduleTourId = getModuleTourIdForPath(pathname);
    if (moduleTourId && isFirstModuleVisit(pathname)) {
      const timer = window.setTimeout(() => {
        markModuleVisited(pathname);
        announceCustomHint(t.companion.firstVisitTourOffer, "context", {
          tourId: moduleTourId,
        });
      }, 6_000);
      return () => window.clearTimeout(timer);
    }

    const contextKey = getNimbusContextHintKey(pathname);
    if (contextKey) {
      const timer = window.setTimeout(() => {
        if (isNimbusHintsSnoozed()) return;
        const tourId = getModuleTourIdForPath(pathname) ?? undefined;
        announceCustomHint(
          t.companion.context[contextKey],
          "context",
          tourId ? { tourId } : undefined
        );
      }, 12_000);
      return () => window.clearTimeout(timer);
    }
  }, [visible, quiet, tourActive, menuOpen, pathname, hintIndex, hintMessage, announceCustomHint, t]);

  useEffect(() => {
    if (!visible || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;
    if (pathname !== "/dashboard") return;
    if (hintIndex !== null || hintMessage !== null) return;
    if (!shouldShowAttentionHintToday()) return;

    const snapshot = readSearchStoresSnapshot();
    const count = countAttentionFromSnapshot(snapshot, t);
    if (count === 0) return;

    const timer = window.setTimeout(() => {
      markAttentionHintShownToday();
      setNpcCalling(true);
      window.setTimeout(() => {
        setNpcCalling(false);
        announceCustomHint(
          t.companion.attentionHint.replace("{count}", String(count)),
          "attention",
          { href: "/dashboard" }
        );
      }, NIMBUS_CALLING_LEAD_MS);
    }, 5_000);

    return () => window.clearTimeout(timer);
  }, [
    visible,
    quiet,
    tourActive,
    menuOpen,
    pathname,
    hintIndex,
    hintMessage,
    announceCustomHint,
    setNpcCalling,
    t,
  ]);

  useEffect(() => {
    if (!visible || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;

    const scheduleAnnouncement = () => {
      if (isNimbusHintsSnoozed()) return;

      const snapshot = readSearchStoresSnapshot();
      const isFamily =
        profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
      const suggestions = filterSuppressedSuggestions(
        detectNimbusSuggestions(snapshot, isFamily)
      );

      if (suggestions.length > 0 && Math.random() < 0.45) {
        const id = suggestions[Math.floor(Math.random() * suggestions.length)] as NimbusSuggestionId;
        announceCustomHint(t.companion.suggestions[id], "suggestion", {
          suggestionId: id,
          href: NIMBUS_SUGGESTION_HREF[id],
        });
        return;
      }

      announceHint(Math.floor(Math.random() * NIMBUS_HINT_COUNT));
    };

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      scheduleAnnouncement();
      intervalId = window.setInterval(scheduleAnnouncement, NIMBUS_HINT_INTERVAL_MS);
    }, NIMBUS_HINT_FIRST_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [visible, quiet, tourActive, menuOpen, announceHint, announceCustomHint, profile, t]);

  useEffect(() => {
    if (!visible || quiet || tourActive || menuOpen || hintIndex !== null || hintMessage !== null) return;
    if (isNimbusHintsSnoozed()) return;

    let timeoutId: number | undefined;

    const scheduleFidget = () => {
      timeoutId = window.setTimeout(() => {
        setNpcCalling(true);
        window.setTimeout(() => {
          setNpcCalling(false);
          scheduleFidget();
        }, 900);
      }, randomBetween(NIMBUS_IDLE_FIDGET_MIN_MS, NIMBUS_IDLE_FIDGET_MAX_MS));
    };

    scheduleFidget();

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [visible, quiet, tourActive, menuOpen, hintIndex, hintMessage, setNpcCalling]);

  if (!visible) return null;

  return (
    <>
      <NimbusTourSync />
      <NimbusCompanion />
      <NimbusTourOverlay />
    </>
  );
}
