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

export async function onRouterTransitionStart(
  ...args: Parameters<
    typeof import("@sentry/nextjs").captureRouterTransitionStart
  >
) {
  if (!shouldActivateSentryRuntime()) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    return Sentry.captureRouterTransitionStart(...args);
  } catch {
    // Router transitions must never fail because monitoring threw.
  }
}
