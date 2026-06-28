import { shouldActivateSentryRuntime } from "@/lib/sentry/shared-options";

export async function register() {
  if (!shouldActivateSentryRuntime()) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(
  ...args: Parameters<
    typeof import("@sentry/nextjs").captureRequestError
  >
) {
  if (!shouldActivateSentryRuntime()) return;

  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
