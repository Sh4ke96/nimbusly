import { FAMILY_SETUP_INTENT } from "@/lib/constants/account";
import { isValidInviteCodeFormat, normalizeInviteCode } from "@/lib/family/invite";

export type OnboardingRpcCall =
  | {
      rpc: "complete_solo_onboarding";
      args: {
        p_first_name: string;
        p_last_name: string;
        p_avatar_color: string;
      };
    }
  | {
      rpc: "onboard_create_family";
      args: {
        p_family_name: string;
        p_first_name: string;
        p_last_name: string;
        p_avatar_color: string;
      };
    }
  | {
      rpc: "onboard_with_invitation_token";
      args: {
        p_token: string;
        p_first_name: string;
        p_last_name: string;
        p_avatar_color: string;
      };
    }
  | {
      rpc: "onboard_with_invite_code";
      args: {
        p_code: string;
        p_first_name: string;
        p_last_name: string;
        p_avatar_color: string;
      };
    };

export type OnboardingRpcResolution =
  | { ok: true; call: OnboardingRpcCall }
  | { ok: false; error: "missing_family_name" | "invalid_invite_code" };

export function resolveOnboardingRpc(input: {
  familyIntent: string;
  firstName: string;
  lastName: string;
  avatarColor: string;
  familyName: string | null;
  inviteToken: string;
  inviteCode: string;
}): OnboardingRpcResolution {
  const profileArgs = {
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_avatar_color: input.avatarColor,
  };

  if (input.familyIntent === FAMILY_SETUP_INTENT.SOLO) {
    return { ok: true, call: { rpc: "complete_solo_onboarding", args: profileArgs } };
  }

  if (input.familyIntent === FAMILY_SETUP_INTENT.CREATE) {
    if (!input.familyName) {
      return { ok: false, error: "missing_family_name" };
    }

    return {
      ok: true,
      call: {
        rpc: "onboard_create_family",
        args: {
          p_family_name: input.familyName,
          ...profileArgs,
        },
      },
    };
  }

  if (input.familyIntent === FAMILY_SETUP_INTENT.JOIN) {
    if (input.inviteToken) {
      return {
        ok: true,
        call: {
          rpc: "onboard_with_invitation_token",
          args: {
            p_token: input.inviteToken,
            ...profileArgs,
          },
        },
      };
    }

    if (!input.inviteCode || !isValidInviteCodeFormat(input.inviteCode)) {
      return { ok: false, error: "invalid_invite_code" };
    }

    return {
      ok: true,
      call: {
        rpc: "onboard_with_invite_code",
        args: {
          p_code: normalizeInviteCode(input.inviteCode),
          ...profileArgs,
        },
      },
    };
  }

  return { ok: true, call: { rpc: "complete_solo_onboarding", args: profileArgs } };
}
