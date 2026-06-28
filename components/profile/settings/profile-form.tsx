"use client";

import { PROFILE_FORM_FIELD } from "@/lib/profile/form";
import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberAvatar } from "@/components/member-avatar";
import { AVATAR_COLORS, resolveAvatarColor, type AvatarColor } from "@/lib/avatar-colors";
import { getDisplayName } from "@/lib/profile";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { SettingsFormFooter } from "@/components/profile/settings/settings-form-footer";
import { NimbusCompanionSetting } from "@/components/profile/settings/nimbus-companion-setting";
import { NotificationPreferencesSetting } from "@/components/profile/settings/notification-preferences-setting";
import { PwaPushSetting } from "@/components/pwa/pwa-push-setting";
import { updateProfile } from "@/app/(app)/account/actions";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";

export function ProfileForm() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(() =>
    resolveAvatarColor(profile?.avatar_color)
  );
  const [syncedAvatarColor, setSyncedAvatarColor] = useState<string | undefined>(
    profile?.avatar_color
  );

  if (profile?.avatar_color && profile.avatar_color !== syncedAvatarColor) {
    setSyncedAvatarColor(profile.avatar_color);
    setAvatarColor(resolveAvatarColor(profile.avatar_color));
  }

  const [state, action, pending] = useActionState(updateProfile, null);

  useActionFeedback(state, () => void refreshProfile());

  const displayColor = resolveAvatarColor(avatarColor || profile?.avatar_color);

  if (!profile) {
    return (
      <div className="space-y-6 max-w-md">
        <Skeleton className="size-12 rounded-none" />
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="size-9 rounded-none" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-9 w-24 rounded-none" />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6 max-w-md" data-nimbus-tour={NIMBUS_TOUR_TARGET.SETTINGS_PROFILE}>
      <div className="flex justify-center sm:justify-start">
        <MemberAvatar name={getDisplayName(profile)} color={displayColor} size="lg" />
      </div>

      <input type="hidden" name={PROFILE_FORM_FIELD.AVATAR_COLOR} value={displayColor} />

      <div className="grid grid-cols-7 gap-3">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => setAvatarColor(color.value)}
            className={cn(
              "size-9 rounded-none transition-all hover:scale-110",
              displayColor === color.value &&
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
            name={PROFILE_FORM_FIELD.FIRST_NAME}
            defaultValue={profile.first_name}
            key={profile.first_name}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="settings-lastName">{t.account.lastNameLabel}</Label>
          <Input
            id="settings-lastName"
            name={PROFILE_FORM_FIELD.LAST_NAME}
            defaultValue={profile.last_name}
            key={profile.last_name}
          />
        </div>
      </div>

      <NimbusCompanionSetting />

      <NotificationPreferencesSetting />

      <PwaPushSetting />

      <SettingsFormFooter
        pending={pending}
        savingLabel={t.account.saving}
        saveLabel={t.account.save}
      />
    </form>
  );
}
