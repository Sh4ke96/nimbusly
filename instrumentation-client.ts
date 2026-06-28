import * as Sentry from "@sentry/nextjs";
import { SENTRY_TUNNEL_ROUTE } from "@/lib/constants/sentry";
import { getSharedSentryInitOptions } from "@/lib/sentry/shared-options";

Sentry.init({
  ...getSharedSentryInitOptions(),
  tunnel: SENTRY_TUNNEL_ROUTE,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
