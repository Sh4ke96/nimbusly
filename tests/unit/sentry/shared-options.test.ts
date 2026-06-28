import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSentryTracesSampleRate,
  isSentryEnabled,
  scrubSentryEvent,
} from "@/lib/sentry/shared-options";

describe("isSentryEnabled", () => {
  it("is false without DSN", () => {
    const previous = process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    assert.equal(isSentryEnabled(), false);
    if (previous) process.env.NEXT_PUBLIC_SENTRY_DSN = previous;
  });

  it("is true when DSN is set", () => {
    const previous = process.env.NEXT_PUBLIC_SENTRY_DSN;
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://example@o0.ingest.sentry.io/0";
    assert.equal(isSentryEnabled(), true);
    if (previous) process.env.NEXT_PUBLIC_SENTRY_DSN = previous;
    else delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });
});

describe("getSentryTracesSampleRate", () => {
  it("returns 0 outside production by default", () => {
    const env = process.env.NODE_ENV;
    const vercel = process.env.VERCEL_ENV;
    process.env.NODE_ENV = "development";
    delete process.env.VERCEL_ENV;
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
    assert.equal(getSentryTracesSampleRate(), 0);
    process.env.NODE_ENV = env;
    if (vercel) process.env.VERCEL_ENV = vercel;
  });
});

describe("scrubSentryEvent", () => {
  it("removes email and sensitive breadcrumb fields", () => {
    const scrubbed = scrubSentryEvent({
      type: undefined,
      user: { id: "user-1", email: "secret@example.com" },
      breadcrumbs: [
        {
          message: "request",
          data: { authorization: "Bearer secret", listId: "abc" },
        },
      ],
    });

    assert.equal(scrubbed.user?.email, undefined);
    assert.equal(scrubbed.user?.id, "user-1");
    assert.equal(scrubbed.breadcrumbs?.[0]?.data?.authorization, "[Filtered]");
    assert.equal(scrubbed.breadcrumbs?.[0]?.data?.listId, "abc");
  });
});
