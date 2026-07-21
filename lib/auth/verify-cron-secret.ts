import { timingSafeEqualString } from "@/lib/auth/timing-safe-equal";

export function isValidCronAuthorization(
  authorizationHeader: string | null,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret || !authorizationHeader) {
    return false;
  }

  return timingSafeEqualString(authorizationHeader, `Bearer ${expectedSecret}`);
}
