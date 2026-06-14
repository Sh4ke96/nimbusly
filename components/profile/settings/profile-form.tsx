"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import { AVATAR_COLORS } from "@/lib/avatar-colors";
import { getDisplayName } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/stores/profile-store";
import { updateProfile, type AccountActionState } from "@/app/(app)/account/actions";
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

export function ProfileForm() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color ?? "");
  const [state, action, pending] = useActionState(updateProfile, null);

  useEffect(() => {
    if (profile?.avatar_color) setAvatarColor(profile.avatar_color);
  }, [profile?.avatar_color]);

  useFormSuccess(state, () => void refreshProfile());

  if (!profile) return null;

  return (
    <form action={action} className="space-y-6 max-w-md">
      <div className="flex justify-center sm:justify-start">
        <MemberAvatar name={getDisplayName(profile)} color={avatarColor} size="lg" />
      </div>

      <input type="hidden" name="avatarColor" value={avatarColor} />

      <div className="flex flex-wrap gap-3">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => setAvatarColor(color.value)}
            className={cn(
              "size-9 rounded-none transition-all hover:scale-110",
              avatarColor === color.value &&
                "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="settings-firstName">{t.account.firstNameLabel}</Label>
          <Input
            id="settings-firstName"
            name="firstName"
            defaultValue={profile.first_name}
            key={profile.first_name}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settings-lastName">{t.account.lastNameLabel}</Label>
          <Input
            id="settings-lastName"
            name="lastName"
            defaultValue={profile.last_name}
            key={profile.last_name}
          />
        </div>
      </div>

      <ActionMessage state={state} />

      <Button type="submit" disabled={pending}>
        {pending ? t.account.saving : t.account.save}
      </Button>
    </form>
  );
}
