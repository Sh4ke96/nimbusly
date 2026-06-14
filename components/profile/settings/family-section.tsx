"use client";

import { PROFILE_FORM_FIELD } from "@/lib/profile/form";
import { FAMILY_FORM_FIELD } from "@/lib/family/form";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import { getDisplayName } from "@/lib/profile";
import { formatInviteCode } from "@/lib/family/invite";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import {
  ensureFamilyInviteCode,
  revokeFamilyInvitation,
  sendFamilyInvitation,
} from "@/app/(app)/account/family-invite-actions";
import { updateFamilyName } from "@/app/(app)/account/actions";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

export function FamilySection() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const family = useProfileStore((s) => s.family);
  const members = useProfileStore((s) => s.members);
  const invitations = useProfileStore((s) => s.invitations);
  const refreshFamily = useProfileStore((s) => s.refreshFamily);
  const [nameState, nameAction, namePending] = useActionState(updateFamilyName, null);
  const [inviteState, inviteAction, invitePending] = useActionState(sendFamilyInvitation, null);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeFamilyInvitation, null);
  const [copied, setCopied] = useState<boolean>(false);
  const ensuringCodeRef = useRef(false);

  const isOwner = family?.created_by === user?.id;
  const displayCode = family?.invite_code ? formatInviteCode(family.invite_code) : null;
  const needsInviteCode = isOwner && !!family?.id && !family.invite_code;

  useActionFeedback(nameState, () => void refreshFamily());
  useActionFeedback(inviteState, () => void refreshFamily());
  useActionFeedback(revokeState, () => void refreshFamily());

  useEffect(() => {
    void refreshFamily();
  }, [refreshFamily]);

  useEffect(() => {
    if (!needsInviteCode || ensuringCodeRef.current) return;

    ensuringCodeRef.current = true;
    void ensureFamilyInviteCode()
      .then(() => refreshFamily())
      .finally(() => {
        ensuringCodeRef.current = false;
      });
  }, [needsInviteCode, refreshFamily]);

  async function copyInviteCode() {
    if (!family?.invite_code) return;
    await navigator.clipboard.writeText(formatInviteCode(family.invite_code));
    setCopied(true);
    toast.success(t.account.familyInviteCopied);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-lg">
      {isOwner ? (
        <form action={nameAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-family-name">{t.account.familyNameLabel}</Label>
            <Input
              id="settings-family-name"
              name={PROFILE_FORM_FIELD.FAMILY_NAME}
              defaultValue={family?.name ?? ""}
              key={family?.name}
            />
          </div>
          <SettingsFormFooter
            pending={namePending}
            savingLabel={t.account.saving}
            saveLabel={t.account.save}
          />
        </form>
      ) : (
        <p className="text-sm font-medium">{family?.name}</p>
      )}

      <div className="space-y-3 rounded-none border border-border bg-muted/30 p-4">
        <div className="space-y-1">
          <p className="font-heading text-sm font-semibold">{t.account.familyInviteCode}</p>
          <p className="text-xs text-muted-foreground">
            {isOwner ? t.account.familyInviteCodeDesc : t.account.familyInviteMemberHint}
          </p>
        </div>

        {displayCode ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-none border border-border bg-background px-3 py-2 font-mono text-sm tracking-widest">
              {displayCode}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={() => void copyInviteCode()}>
              <Copy className="size-4" />
              {copied ? t.account.familyInviteCopied : t.account.familyInviteCopy}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {needsInviteCode ? t.account.familyInviteLoading : t.account.familyInviteUnavailable}
          </p>
        )}

        {isOwner && (
          <form action={inviteAction} className="space-y-3 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="family-invite-email">{t.account.familyInviteEmailLabel}</Label>
              <Input
                id="family-invite-email"
                name={FAMILY_FORM_FIELD.EMAIL}
                type="email"
                placeholder={t.account.familyInviteEmailPlaceholder}
                required
              />
            </div>
            <SettingsFormFooter
              pending={invitePending}
              savingLabel={t.account.saving}
              saveLabel={t.account.familyInviteSend}
            />
          </form>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t.account.familyMembers}
        </p>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-none border border-border px-3 py-2"
            >
              <MemberAvatar
                name={getDisplayName(member)}
                color={member.avatar_color}
                size="sm"
              />
              <span className="text-sm font-medium">{getDisplayName(member)}</span>
            </li>
          ))}
        </ul>
      </div>

      {isOwner && invitations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t.account.familyInvitePending}
          </p>
          <ul className="space-y-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between gap-3 rounded-none border border-border px-3 py-2"
              >
                <span className="text-sm text-muted-foreground truncate">{invitation.email}</span>
                <form action={revokeAction}>
                  <input type="hidden" name={FAMILY_FORM_FIELD.INVITATION_ID} value={invitation.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={revokePending}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="size-4" />
                    {t.account.familyInviteRevoke}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
