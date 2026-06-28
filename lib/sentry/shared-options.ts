import type { ErrorEvent, Event } from "@sentry/core";
import {
  SENSITIVE_SENTRY_KEY_PATTERN,
  SENTRY_DEFAULT_TRACES_SAMPLE_RATE,
} from "@/lib/constants/sentry";

export function getSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

export function isSentryEnabled(): boolean {
  return Boolean(getSentryDsn());
}

export function getSentryEnvironment(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

export function getSentryTracesSampleRate(): number {
  const raw = process.env.SENTRY_TRACES_SAMPLE_RATE;
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
  }
  return getSentryEnvironment() === "production"
    ? SENTRY_DEFAULT_TRACES_SAMPLE_RATE
    : 0;
}

function scrubRecord(
  record: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!record) return record;

  const next: Record<string, unknown> = { ...record };
  for (const key of Object.keys(next)) {
    if (SENSITIVE_SENTRY_KEY_PATTERN.test(key)) {
      next[key] = "[Filtered]";
    }
  }
  return next;
}

export function scrubSentryEvent<T extends Event>(event: T): T {
  if (event.user) {
    event.user = {
      id: event.user.id,
      username: event.user.username,
    };
  }

  if (event.request?.headers) {
    event.request.headers = scrubRecord(
      event.request.headers as Record<string, unknown>
    ) as typeof event.request.headers;
  }

  if (event.request?.cookies) {
    event.request.cookies = scrubRecord(
      event.request.cookies as Record<string, unknown>
    ) as typeof event.request.cookies;
  }

  if (event.extra) {
    event.extra = scrubRecord(event.extra as Record<string, unknown>);
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (!breadcrumb.data) return breadcrumb;
      return {
        ...breadcrumb,
        data: scrubRecord(breadcrumb.data as Record<string, unknown>),
      };
    });
  }

  return event;
}

export function beforeSendSentryEvent(event: ErrorEvent): ErrorEvent | null {
  return scrubSentryEvent(event);
}

export function getSharedSentryInitOptions() {
  return {
    dsn: getSentryDsn(),
    enabled: isSentryEnabled(),
    environment: getSentryEnvironment(),
    tracesSampleRate: getSentryTracesSampleRate(),
    sendDefaultPii: false,
    beforeSend: beforeSendSentryEvent,
  } as const;
}
