"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/member-avatar";
import { getDisplayName } from "@/lib/profile";
import { FAMILY_ROLE } from "@/lib/constants/account";
import { familyRoleLabel, isFamilyAdmin, isFamilyFounder } from "@/lib/profile/family-roles";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { updateFamilyMemberRole } from "@/app/(app)/account/family-permissions-actions";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, UserRound } from "lucide-react";

const ROLE_BADGE_CLASS = cn(
  "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[11px] font-medium"
);

export function FamilyPermissionsSection() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const family = useProfileStore((s) => s.family);
  const members = useProfileStore((s) => s.members);
  const refreshFamily = useProfileStore((s) => s.refreshFamily);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [state, action, pending] = useActionState(updateFamilyMemberRole, null);

  const canManage = isFamilyAdmin(profile, family, user?.id);

  useActionFeedback(state, () => {
    void refreshFamily();
    void refreshProfile();
  });

  useEffect(() => {
    void refreshFamily();
  }, [refreshFamily]);

  return (
    <div className="space-y-8 max-w-2xl">
      <p className="text-sm text-muted-foreground">{t.account.permissionsDesc}</p>

      <div className="space-y-3">
        <h3 className="font-heading text-sm font-semibold">{t.account.permissionsMembersTitle}</h3>
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
                        <span className={cn(ROLE_BADGE_CLASS, "bg-secondary text-secondary-foreground")}>
                          <Shield className="size-3" />
                          {t.account.permissionsFounder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && !founder && !isSelf && (
                  <div className="flex shrink-0 gap-2">
                    {role === FAMILY_ROLE.MEMBER ? (
                      <form action={action}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <input type="hidden" name="role" value={FAMILY_ROLE.ADMIN} />
                        <Button type="submit" variant="outline" size="sm" disabled={pending}>
                          {t.account.permissionsMakeAdmin}
                        </Button>
                      </form>
                    ) : (
                      <form action={action}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <input type="hidden" name="role" value={FAMILY_ROLE.MEMBER} />
                        <Button type="submit" variant="outline" size="sm" disabled={pending}>
                          {t.account.permissionsMakeMember}
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {!canManage && (
        <p className="text-xs text-muted-foreground">{t.account.permissionsMemberHint}</p>
      )}

      <div className="rounded-none border border-dashed border-border bg-muted/30 p-4">
        <p className="font-heading text-sm font-semibold">{t.account.permissionsMoreTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.account.permissionsMoreDesc}</p>
      </div>
    </div>
  );
}
