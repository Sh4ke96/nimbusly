import { SENTRY_TUNNEL_ROUTE } from "@/lib/constants/sentry";
import {
  getSharedSentryInitOptions,
  shouldActivateSentryRuntime,
} from "@/lib/sentry/shared-options";

if (shouldActivateSentryRuntime()) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      ...getSharedSentryInitOptions(),
      tunnel: SENTRY_TUNNEL_ROUTE,
    });
  });
}

/** Intentionally disabled — router transition tracing sent many /monitoring requests per click. */
export function onRouterTransitionStart() {
  return;
}
