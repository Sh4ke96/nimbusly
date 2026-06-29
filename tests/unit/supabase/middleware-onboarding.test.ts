import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readOnboardingCompleteCookieValue,
  readOnboardingCompleteFromRequestCookies,
} from "@/lib/supabase/middleware-onboarding";
import { ONBOARDING_COMPLETE_COOKIE, ONBOARDING_COMPLETE_COOKIE_VALUE } from "@/lib/constants/session-cookies";

describe("middleware onboarding cookie", () => {
  it("reads complete and incomplete values", () => {
    assert.equal(readOnboardingCompleteCookieValue(ONBOARDING_COMPLETE_COOKIE_VALUE), true);
    assert.equal(readOnboardingCompleteCookieValue("0"), false);
    assert.equal(readOnboardingCompleteCookieValue(undefined), null);
  });

  it("reads from request cookie list", () => {
    assert.equal(
      readOnboardingCompleteFromRequestCookies([
        { name: ONBOARDING_COMPLETE_COOKIE, value: ONBOARDING_COMPLETE_COOKIE_VALUE },
      ]),
      true
    );
    assert.equal(readOnboardingCompleteFromRequestCookies([]), null);
  });
});
