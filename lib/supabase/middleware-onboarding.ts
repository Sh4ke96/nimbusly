import {
  ONBOARDING_COMPLETE_COOKIE,
  ONBOARDING_COMPLETE_COOKIE_VALUE,
} from "@/lib/constants/session-cookies";

export function readOnboardingCompleteCookieValue(
  cookieValue: string | undefined
): boolean | null {
  if (cookieValue === ONBOARDING_COMPLETE_COOKIE_VALUE) return true;
  if (cookieValue === "0") return false;
  return null;
}

export function readOnboardingCompleteFromRequestCookies(
  cookies: { name: string; value: string }[]
): boolean | null {
  const value = cookies.find((cookie) => cookie.name === ONBOARDING_COMPLETE_COOKIE)?.value;
  return readOnboardingCompleteCookieValue(value);
}
