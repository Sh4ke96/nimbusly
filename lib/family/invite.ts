/** Normalizes invite code input (strip spaces/dashes, uppercase). */
import { INVITE_CODE_COOKIE } from "@/lib/family/constants";

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, "");
}

/** Formats 8-char code as XXXX-XXXX for display. */
export function formatInviteCode(code: string): string {
  const normalized = normalizeInviteCode(code);
  if (normalized.length !== 8) return code.trim().toUpperCase();
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
}

export function isValidInviteCodeFormat(code: string): boolean {
  return normalizeInviteCode(code).length === 8;
}

export function buildFamilyInviteRegisterUrl(origin: string, token: string): string {
  const url = new URL("/register", origin);
  url.searchParams.set("invite", token);
  return url.toString();
}

export function buildFamilyInviteCodeRegisterUrl(origin: string, code: string): string {
  const url = new URL("/register", origin);
  url.searchParams.set("code", formatInviteCode(code));
  return url.toString();
}

/** Reads invite code cookie set during registration (client only). */
export function readInviteCodeFromCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${INVITE_CODE_COOKIE}=`));
  const raw = match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
  return raw ? formatInviteCode(raw) : "";
}
