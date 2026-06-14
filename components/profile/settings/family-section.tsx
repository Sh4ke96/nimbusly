"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import { getDisplayName } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { updateFamilyName, type AccountActionState } from "@/app/(app)/account/actions";
import { ActionMessage } from "@/components/profile/action-message";

function useFormSuccess(state: AccountActionState, onSuccess: () => void) {
  const handled = useRef(false);

  useEffect(() => {
    handled.current = false;
  }, []);

  useEffect(() => {
    if (!state || !("success" in state) || handled.current) return;
    handled.current = true;
    onSuccess();
  }, [state, onSuccess]);
}

export function FamilySection() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const family = useProfileStore((s) => s.family);
  const members = useProfileStore((s) => s.members);
  const refreshFamily = useProfileStore((s) => s.refreshFamily);
  const [state, action, pending] = useActionState(updateFamilyName, null);

  const isOwner = family?.created_by === user?.id;

  useFormSuccess(state, () => void refreshFamily());

  return (
    <div className="space-y-6 max-w-lg">
      {isOwner ? (
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-family-name">{t.account.familyNameLabel}</Label>
            <Input
              id="settings-family-name"
              name="familyName"
              defaultValue={family?.name ?? ""}
              key={family?.name}
            />
          </div>
          <ActionMessage state={state} />
          <Button type="submit" disabled={pending}>
            {pending ? t.account.saving : t.account.save}
          </Button>
        </form>
      ) : (
        <p className="text-sm font-medium">{family?.name}</p>
      )}

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
        {members.length <= 1 && (
          <p className="text-xs text-muted-foreground">{t.account.familyInviteSoon}</p>
        )}
      </div>
    </div>
  );
}
