import { INVITE_MAX_AGE_SEC } from "@/lib/family/constants";
import { isProductionNodeEnv } from "@/lib/env/node-env";

export function getInviteCookieOptions() {
  return {
    path: "/",
    maxAge: INVITE_MAX_AGE_SEC,
    sameSite: "lax" as const,
    secure: isProductionNodeEnv(),
  };
}

export function buildInviteClientCookie(name: string, value: string): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  return `${name}=${encodeURIComponent(value)}; path=/; max-age=${INVITE_MAX_AGE_SEC}; samesite=lax${
    secure ? "; secure" : ""
  }`;
}
