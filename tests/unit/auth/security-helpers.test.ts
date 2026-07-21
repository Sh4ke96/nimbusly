import assert from "node:assert/strict";
import test from "node:test";
import { resolveSafeRedirectPath } from "@/lib/auth/safe-redirect-path";
import { isValidCronAuthorization } from "@/lib/auth/verify-cron-secret";
import { sanitizeMarkdownLinkUrl } from "@/lib/notes/sanitize-markdown-link";
import { isValidPushSubscriptionInput } from "@/lib/push/validate-subscription";

test("resolveSafeRedirectPath allows relative app paths", () => {
  assert.equal(resolveSafeRedirectPath("/dashboard", "/onboarding"), "/dashboard");
  assert.equal(resolveSafeRedirectPath("/budget?tab=expenses", "/onboarding"), "/budget?tab=expenses");
});

test("resolveSafeRedirectPath blocks open redirects", () => {
  assert.equal(resolveSafeRedirectPath("https://evil.com", "/onboarding"), "/onboarding");
  assert.equal(resolveSafeRedirectPath("//evil.com", "/onboarding"), "/onboarding");
  assert.equal(resolveSafeRedirectPath("/@evil.com", "/onboarding"), "/onboarding");
  assert.equal(resolveSafeRedirectPath("javascript:alert(1)", "/onboarding"), "/onboarding");
});

test("isValidCronAuthorization compares bearer tokens safely", () => {
  assert.equal(isValidCronAuthorization("Bearer secret", "secret"), true);
  assert.equal(isValidCronAuthorization("Bearer wrong", "secret"), false);
  assert.equal(isValidCronAuthorization(null, "secret"), false);
});

test("sanitizeMarkdownLinkUrl allows safe protocols only", () => {
  assert.equal(sanitizeMarkdownLinkUrl("https://example.com"), "https://example.com/");
  assert.equal(sanitizeMarkdownLinkUrl("/notes"), "/notes");
  assert.equal(sanitizeMarkdownLinkUrl("javascript:alert(1)"), "");
});

test("isValidPushSubscriptionInput validates shape", () => {
  assert.equal(
    isValidPushSubscriptionInput({
      endpoint: "https://push.example.com/send/abc",
      keys: { p256dh: "key", auth: "auth" },
    }),
    true
  );
  assert.equal(
    isValidPushSubscriptionInput({
      endpoint: "javascript:alert(1)",
      keys: { p256dh: "key", auth: "auth" },
    }),
    false
  );
});
