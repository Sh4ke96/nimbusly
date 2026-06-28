export const SENTRY_DSN_ENV = "NEXT_PUBLIC_SENTRY_DSN" as const;

export const SENTRY_TUNNEL_ROUTE = "/monitoring" as const;

export const SENTRY_DEFAULT_TRACES_SAMPLE_RATE = 0.1 as const;

export const SENSITIVE_SENTRY_KEY_PATTERN =
  /password|token|secret|authorization|cookie|api[_-]?key|service[_-]?role/i;
