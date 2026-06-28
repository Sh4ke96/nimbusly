"use client";

import { PROFILE_FORM_FIELD } from "@/lib/profile/form";
import { FAMILY_FORM_FIELD } from "@/lib/family/form";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import { getDisplayName } from "@/lib/profile";
import { formatInviteCode } from "@/lib/family/invite";
import { FAMILY_ROLE } from "@/lib/constants/account";
import { familyRoleLabel, isFamilyAdmin, isFamilyFounder } from "@/lib/profile/family-roles";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import {
  ensureFamilyInviteCode,
  revokeFamilyInvitation,
  sendFamilyInvitation,
} from "@/app/(app)/account/family-invite-actions";
import { updateFamilyName } from "@/app/(app)/account/actions";
import {
  leaveFamily,
  removeFamilyMember,
  transferFamilyOwnership,
  updateFamilyMemberRole,
} from "@/app/(app)/account/family-member-actions";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { cn } from "@/lib/utils";
import { Copy, Crown, Shield, ShieldCheck, UserMinus, UserRound, X } from "lucide-react";
import { toast } from "sonner";

const ROLE_BADGE_CLASS = cn(
  "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[11px] font-medium"
);

type ConfirmAction = "remove" | "transfer" | "leave";

export function FamilySection() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const family = useProfileStore((s) => s.family);
  const members = useProfileStore((s) => s.members);
  const invitations = useProfileStore((s) => s.invitations);
  const refreshFamily = useProfileStore((s) => s.refreshFamily);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [nameState, nameAction, namePending] = useActionState(updateFamilyName, null);
  const [inviteState, inviteAction, invitePending] = useActionState(sendFamilyInvitation, null);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeFamilyInvitation, null);
  const [roleState, roleAction, rolePending] = useActionState(updateFamilyMemberRole, null);
  const [removeState, removeAction, removePending] = useActionState(removeFamilyMember, null);
  const [transferState, transferAction, transferPending] = useActionState(
    transferFamilyOwnership,
    null
  );
  const [leaveState, leaveAction, leavePending] = useActionState(leaveFamily, null);
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const ensuringCodeRef = useRef(false);
  const celebrate = useNimbusCelebration();

  const isOwner = family?.created_by === user?.id;
  const canManage = isFamilyAdmin(profile, family, user?.id);
  const isFounder = isFamilyFounder(family, user?.id);
  const displayCode = family?.invite_code ? formatInviteCode(family.invite_code) : null;
  const needsInviteCode = isOwner && !!family?.id && !family.invite_code;
  const targetMember = members.find((member) => member.id === targetMemberId) ?? null;
  const otherMembers = members.filter((member) => member.id !== user?.id);
  const founderMustTransfer = isFounder && otherMembers.length > 0;
  const actionPending =
    namePending ||
    invitePending ||
    revokePending ||
    rolePending ||
    removePending ||
    transferPending ||
    leavePending;

  useActionFeedback(nameState, () => void refreshFamily());
  useActionFeedback(inviteState, () => {
    celebrate("firstFamilyInvite");
    void refreshFamily();
  });
  useActionFeedback(revokeState, () => void refreshFamily());
  useActionFeedback(roleState, () => {
    void refreshFamily();
    void refreshProfile();
  });
  useActionFeedback(removeState, () => {
    void refreshFamily();
    void refreshProfile();
  });
  useActionFeedback(transferState, () => {
    void refreshFamily();
    void refreshProfile();
  });
  useActionFeedback(leaveState, () => {
    void refreshFamily();
    void refreshProfile();
  });

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

  function openConfirm(action: ConfirmAction, memberId?: string) {
    setConfirmAction(action);
    setTargetMemberId(memberId ?? null);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmAction(null);
    setTargetMemberId(null);
  }

  function confirmTitle(): string {
    if (confirmAction === "leave") return t.account.leaveFamilyDialogTitle;
    if (confirmAction === "transfer") return t.account.transferFounderDialogTitle;
    return t.account.removeMemberDialogTitle;
  }

  function confirmDescription(): string {
    if (confirmAction === "leave") {
      return founderMustTransfer
        ? t.account.leaveFamilyFounderBlockedDesc
        : t.account.leaveFamilyDialogDesc;
    }
    if (confirmAction === "transfer" && targetMember) {
      return t.account.transferFounderDialogDesc.replace(
        "{name}",
        getDisplayName(targetMember)
      );
    }
    if (confirmAction === "remove" && targetMember) {
      return t.account.removeMemberDialogDesc.replace("{name}", getDisplayName(targetMember));
    }
    return "";
  }

  return (
    <>
      <div className="space-y-8 max-w-2xl">
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
                    <input
                      type="hidden"
                      name={FAMILY_FORM_FIELD.INVITATION_ID}
                      value={invitation.id}
                    />
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

        <div
          className="space-y-3"
          data-nimbus-tour={NIMBUS_TOUR_TARGET.FAMILY_MEMBERS}
        >
          <p className="text-sm text-muted-foreground">{t.account.permissionsDesc}</p>
          <h3
            className="font-heading text-sm font-semibold"
            data-nimbus-tour={NIMBUS_TOUR_TARGET.FAMILY_PERMISSIONS}
          >
            {t.account.permissionsMembersTitle}
          </h3>
          <ul className="divide-y divide-border rounded-none border border-border">
            {members.map((member) => {
              const founder = isFamilyFounder(family, member.id);
              const role = founder ? FAMILY_ROLE.ADMIN : member.family_role ?? FAMILY_ROLE.MEMBER;
              const isSelf = member.id === user?.id;

              return (
                <li
                  key={member.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar
                      name={getDisplayName(member)}
                      color={member.avatar_color}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {getDisplayName(member)}
                        {isSelf && (
                          <span className="text-muted-foreground font-normal">
                            {" "}
                            ({t.account.permissionsYou})
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {role === FAMILY_ROLE.ADMIN ? (
                          <span className={cn(ROLE_BADGE_CLASS, "bg-primary/10 text-primary")}>
                            <ShieldCheck className="size-3" />
                            {familyRoleLabel(FAMILY_ROLE.ADMIN, t.account)}
                          </span>
                        ) : (
                          <span className={cn(ROLE_BADGE_CLASS, "bg-muted text-muted-foreground")}>
                            <UserRound className="size-3" />
                            {familyRoleLabel(FAMILY_ROLE.MEMBER, t.account)}
                          </span>
                        )}
                        {founder && (
                          <span
                            className={cn(
                              ROLE_BADGE_CLASS,
                              "bg-secondary text-secondary-foreground"
                            )}
                          >
                            <Shield className="size-3" />
                            {t.account.permissionsFounder}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {canManage && !founder && !isSelf && (
                      <>
                        {role === FAMILY_ROLE.MEMBER ? (
                          <form action={roleAction}>
                            <input
                              type="hidden"
                              name={FAMILY_FORM_FIELD.MEMBER_ID}
                              value={member.id}
                            />
                            <input
                              type="hidden"
                              name={FAMILY_FORM_FIELD.ROLE}
                              value={FAMILY_ROLE.ADMIN}
                            />
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              disabled={actionPending}
                            >
                              {t.account.permissionsMakeAdmin}
                            </Button>
                          </form>
                        ) : (
                          <form action={roleAction}>
                            <input
                              type="hidden"
                              name={FAMILY_FORM_FIELD.MEMBER_ID}
                              value={member.id}
                            />
                            <input
                              type="hidden"
                              name={FAMILY_FORM_FIELD.ROLE}
                              value={FAMILY_ROLE.MEMBER}
                            />
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              disabled={actionPending}
                            >
                              {t.account.permissionsMakeMember}
                            </Button>
                          </form>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={actionPending}
                          className="text-destructive hover:text-destructive"
                          onClick={() => openConfirm("remove", member.id)}
                        >
                          <UserMinus className="size-3.5" />
                          {t.account.removeMemberBtn}
                        </Button>
                      </>
                    )}

                    {isFounder && !isSelf && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={actionPending}
                        onClick={() => openConfirm("transfer", member.id)}
                      >
                        <Crown className="size-3.5" />
                        {t.account.transferFounderBtn}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {!canManage && (
          <p className="text-xs text-muted-foreground">{t.account.permissionsMemberHint}</p>
        )}

        <div
          className="space-y-3 rounded-none border border-border bg-muted/30 p-4"
          data-nimbus-tour={NIMBUS_TOUR_TARGET.FAMILY_LEAVE}
        >
          <div className="space-y-1">
            <p className="font-heading text-sm font-semibold">{t.account.leaveFamilyTitle}</p>
            <p className="text-xs text-muted-foreground">
              {founderMustTransfer
                ? t.account.leaveFamilyFounderBlockedDesc
                : t.account.leaveFamilyDesc}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={actionPending || founderMustTransfer}
            className="text-destructive hover:text-destructive"
            onClick={() => openConfirm("leave")}
          >
            {t.account.leaveFamilyBtn}
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{confirmTitle()}</DialogTitle>
            <DialogDescription>{confirmDescription()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-none" onClick={closeConfirm}>
              {t.account.accountTypeConfirmDialogCancel}
            </Button>
            {confirmAction === "remove" && targetMemberId && (
              <form
                action={removeAction}
                onSubmit={() => {
                  closeConfirm();
                }}
              >
                <input type="hidden" name={FAMILY_FORM_FIELD.MEMBER_ID} value={targetMemberId} />
                <Button
                  type="submit"
                  className="rounded-none"
                  disabled={removePending}
                  variant="destructive"
                >
                  {t.account.removeMemberDialogConfirm}
                </Button>
              </form>
            )}
            {confirmAction === "transfer" && targetMemberId && (
              <form
                action={transferAction}
                onSubmit={() => {
                  closeConfirm();
                }}
              >
                <input type="hidden" name={FAMILY_FORM_FIELD.MEMBER_ID} value={targetMemberId} />
                <Button type="submit" className="rounded-none" disabled={transferPending}>
                  {t.account.transferFounderDialogConfirm}
                </Button>
              </form>
            )}
            {confirmAction === "leave" && !founderMustTransfer && (
              <form
                action={leaveAction}
                onSubmit={() => {
                  closeConfirm();
                }}
              >
                <Button
                  type="submit"
                  className="rounded-none"
                  disabled={leavePending}
                  variant="destructive"
                >
                  {t.account.leaveFamilyDialogConfirm}
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
