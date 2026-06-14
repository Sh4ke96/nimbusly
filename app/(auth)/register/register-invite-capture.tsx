"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  INVITE_CODE_COOKIE,
  INVITE_MAX_AGE_SEC,
  INVITE_TOKEN_COOKIE,
} from "@/lib/family/constants";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";

function setInviteCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${INVITE_MAX_AGE_SEC}; samesite=lax`;
}

export function RegisterInviteCapture() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const inviteCode = searchParams.get("code");

  useEffect(() => {
    if (inviteToken) {
      setInviteCookie(INVITE_TOKEN_COOKIE, inviteToken);
    }
  }, [inviteToken]);

  useEffect(() => {
    if (!inviteCode || !isValidInviteCodeFormat(inviteCode)) return;
    setInviteCookie(INVITE_CODE_COOKIE, normalizeInviteCode(inviteCode));
  }, [inviteCode]);

  return null;
}
