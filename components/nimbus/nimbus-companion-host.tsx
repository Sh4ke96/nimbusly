"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NimbusCompanion } from "@/components/nimbus/nimbus-companion";
import { NimbusDriverTour } from "@/components/nimbus/nimbus-driver-tour";
import {
  NIMBUS_HINT_COUNT,
  NIMBUS_HINT_FIRST_DELAY_MS,
  NIMBUS_HINT_INTERVAL_MS,
  NIMBUS_IDLE_FIDGET_MAX_MS,
  NIMBUS_IDLE_FIDGET_MIN_MS,
  NIMBUS_JOKE_CHANCE,
  NIMBUS_SESSION_GREETING_DELAY_MS,
} from "@/lib/constants/nimbus";
import { NIMBUS_HINT_ACTION_LABEL } from "@/lib/constants/nimbus";
import { NIMBUS_TOUR_ID, NIMBUS_TOUR_TARGET, getModuleTourIdForPath } from "@/lib/constants/nimbus-tour";
import { countAttentionFromSnapshot } from "@/lib/nimbus/attention-count";
import { formatNimbusSessionGreeting, pickRandomNimbusJoke } from "@/lib/nimbus/banter";
import { buildChangelogHintMessage } from "@/lib/nimbus/changelog-hint";
import { markChangelogSeen, shouldShowChangelogHint } from "@/lib/nimbus/changelog-seen";
import { getNimbusContextHintKey } from "@/lib/nimbus/context-hints";
import {
  markContextHintShown,
  shouldShowContextHint,
} from "@/lib/nimbus/hint-frequency";
import {
  clearNimbusMessageQueue,
  enqueueNimbusAttentionHint,
  enqueueNimbusMessage,
  initNimbusMessageDispatcher,
  NIMBUS_MESSAGE_PRIORITY,
} from "@/lib/nimbus/message-dispatcher";
import { detectNimbusSuggestions, type NimbusSuggestionId } from "@/lib/nimbus/suggestions";
import { filterSuppressedSuggestions } from "@/lib/nimbus/suggestion-suppress";
import { NIMBUS_SUGGESTION_HREF } from "@/lib/nimbus/suggestion-links";
import { isFirstModuleVisit, markModuleVisited } from "@/lib/nimbus/first-visit";
import { markIntroTourOffered, shouldOfferIntroTour } from "@/lib/nimbus/onboarding-offer";
import { isNimbusHintsSnoozed } from "@/lib/nimbus/snooze";
import {
  markSessionGreetingShown,
  shouldShowSessionGreeting,
} from "@/lib/nimbus/session-greeting";
import { readSearchStoresSnapshot } from "@/lib/search/search-stores-snapshot";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { getDisplayName } from "@/lib/profile";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNimbusStore } from "@/lib/stores/nimbus-store";
import { useLang, useT } from "@/lib/lang-context";
import { usePageVisible } from "@/lib/hooks/use-page-visible";

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
  const { lang } = useLang();
  const pathname = usePathname();
  const pageVisible = usePageVisible();
  const loaded = useProfileStore((s) => s.loaded);
  const profile = useProfileStore((s) => s.profile);
  const tourActive = useNimbusStore((s) => s.tourActive);
  const menuOpen = useNimbusStore((s) => s.menuOpen);
  const setNpcCalling = useNimbusStore((s) => s.setNpcCalling);
  const onboardingOffered = useRef(false);
  const sessionGreetingOffered = useRef(false);
  const changelogOffered = useRef(false);

  const enabled = profile?.nimbus_companion_enabled !== false;
  const quiet = profile?.nimbus_companion_quiet === true;
  const visible =
    loaded &&
    !!profile?.onboarding_completed &&
    enabled &&
    pathname !== "/onboarding";
  const companionActive = visible && pageVisible;

  useEffect(() => {
    if (pageVisible) return;
    setNpcCalling(false);
  }, [pageVisible, setNpcCalling]);

  useEffect(() => {
    initNimbusMessageDispatcher();
  }, []);

  useEffect(() => {
    if (tourActive || menuOpen) {
      clearNimbusMessageQueue();
    }
  }, [tourActive, menuOpen]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;
    if (!shouldShowSessionGreeting() || sessionGreetingOffered.current) return;

    const greeting = formatNimbusSessionGreeting(
      t.companion.sessionGreetings,
      profile ? getDisplayName(profile) : null
    );
    if (!greeting) return;

    sessionGreetingOffered.current = true;
    enqueueNimbusMessage({
      id: "session-greeting",
      priority: NIMBUS_MESSAGE_PRIORITY.greeting,
      kind: "greeting",
      delayMs: NIMBUS_SESSION_GREETING_DELAY_MS,
      onConsumed: () => {
        if (!shouldShowSessionGreeting()) return;
        markSessionGreetingShown();
      },
      message: greeting,
    });
  }, [companionActive, quiet, tourActive, menuOpen, profile, t]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;
    if (!shouldShowChangelogHint() || changelogOffered.current) return;

    const message = buildChangelogHintMessage(
      lang,
      t.companion.changelogHintIntro,
      t.companion.changelogHintOutro
    );
    if (!message) return;

    changelogOffered.current = true;
    enqueueNimbusMessage({
      id: "changelog-version",
      priority: NIMBUS_MESSAGE_PRIORITY.changelog,
      kind: "changelog",
      delayMs: 10_000,
      message,
      action: {
        href: "/change-log",
        actionLabel: NIMBUS_HINT_ACTION_LABEL.GO,
        changelog: true,
      },
      onConsumed: () => markChangelogSeen(),
    });
  }, [companionActive, quiet, tourActive, menuOpen, lang, t]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen) return;
    if (!shouldOfferIntroTour() || onboardingOffered.current) return;

    onboardingOffered.current = true;
    enqueueNimbusMessage({
      id: "intro-tour-offer",
      priority: NIMBUS_MESSAGE_PRIORITY.context,
      kind: "context",
      delayMs: 8_000,
      message: t.companion.onboardingIntroOffer,
      action: { tourId: NIMBUS_TOUR_ID.INTRO, actionLabel: NIMBUS_HINT_ACTION_LABEL.TOUR },
      onConsumed: markIntroTourOffered,
    });
  }, [companionActive, quiet, tourActive, menuOpen, t]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;

    const moduleTourId = getModuleTourIdForPath(pathname);
    if (moduleTourId && isFirstModuleVisit(pathname)) {
      enqueueNimbusMessage({
        id: `first-visit-${pathname}`,
        priority: NIMBUS_MESSAGE_PRIORITY.context,
        kind: "context",
        delayMs: 6_000,
        message: t.companion.firstVisitTourOffer,
        action: { tourId: moduleTourId, actionLabel: NIMBUS_HINT_ACTION_LABEL.TOUR },
        onConsumed: () => markModuleVisited(pathname),
      });
      return;
    }

    const contextKey = getNimbusContextHintKey(pathname);
    if (!contextKey || !shouldShowContextHint(contextKey)) return;

    const tourId = getModuleTourIdForPath(pathname) ?? undefined;
    enqueueNimbusMessage({
      id: `context-${contextKey}`,
      priority: NIMBUS_MESSAGE_PRIORITY.context,
      kind: "context",
      delayMs: 12_000,
      message: t.companion.context[contextKey],
      action: tourId
        ? { tourId, actionLabel: NIMBUS_HINT_ACTION_LABEL.TOUR, contextKey }
        : { contextKey },
      onConsumed: () => markContextHintShown(contextKey),
    });
  }, [companionActive, quiet, tourActive, menuOpen, pathname, t]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;
    if (pathname !== "/dashboard") return;
    if (!shouldShowAttentionHintToday()) return;

    const snapshot = readSearchStoresSnapshot();
    const count = countAttentionFromSnapshot(snapshot, t);
    if (count === 0) return;

    const message =
      count > 3
        ? t.companion.attentionHintMany.replace("{count}", String(count))
        : t.companion.attentionHint.replace("{count}", String(count));

    enqueueNimbusAttentionHint(
      message,
      {
        scrollTarget: NIMBUS_TOUR_TARGET.DASHBOARD_ATTENTION,
        actionLabel: NIMBUS_HINT_ACTION_LABEL.SHOW,
      },
      {
        delayMs: 5_000,
        onConsumed: markAttentionHintShownToday,
      }
    );
  }, [companionActive, quiet, tourActive, menuOpen, pathname, t]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen || isNimbusHintsSnoozed()) return;

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
        enqueueNimbusMessage({
          priority: NIMBUS_MESSAGE_PRIORITY.suggestion,
          kind: "suggestion",
          message: t.companion.suggestions[id],
          action: {
            suggestionId: id,
            href: NIMBUS_SUGGESTION_HREF[id],
            actionLabel: NIMBUS_HINT_ACTION_LABEL.GO,
          },
        });
        return;
      }

      if (Math.random() < NIMBUS_JOKE_CHANCE) {
        const joke = pickRandomNimbusJoke(t.companion.jokes);
        if (joke) {
          enqueueNimbusMessage({
            priority: NIMBUS_MESSAGE_PRIORITY.joke,
            kind: "joke",
            message: joke,
          });
          return;
        }
      }

      enqueueNimbusMessage({
        priority: NIMBUS_MESSAGE_PRIORITY.random,
        kind: "random",
        hintIndex: Math.floor(Math.random() * NIMBUS_HINT_COUNT),
      });
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
  }, [companionActive, quiet, tourActive, menuOpen, profile, t]);

  useEffect(() => {
    if (!companionActive || quiet || tourActive || menuOpen) return;
    if (isNimbusHintsSnoozed()) return;

    const state = useNimbusStore.getState();
    if (state.hintMessage !== null || state.hintIndex !== null) return;

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
  }, [companionActive, quiet, tourActive, menuOpen, setNpcCalling]);

  if (!visible) return null;

  return (
    <>
      <NimbusDriverTour />
      <NimbusCompanion />
    </>
  );
}
