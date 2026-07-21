"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  INVITE_CODE_COOKIE,
  INVITE_TOKEN_COOKIE,
} from "@/lib/family/constants";
import { buildInviteClientCookie } from "@/lib/family/invite-cookie-options";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";

export function RegisterInviteCapture() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const inviteCode = searchParams.get("code");

  useEffect(() => {
    if (inviteToken) {
      document.cookie = buildInviteClientCookie(INVITE_TOKEN_COOKIE, inviteToken);
    }
  }, [inviteToken]);

  useEffect(() => {
    if (!inviteCode || !isValidInviteCodeFormat(inviteCode)) return;
    document.cookie = buildInviteClientCookie(
      INVITE_CODE_COOKIE,
      normalizeInviteCode(inviteCode)
    );
  }, [inviteCode]);

  return null;
}
