"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/lib/stores/profile-store";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { CreateFamilyForm } from "@/components/profile/settings/create-family-form";
import { JoinFamilyForm } from "@/components/profile/settings/join-family-form";
import { Heart, User } from "lucide-react";

function AccountModeCard({
  active,
  icon,
  title,
  description,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "flex h-auto w-full items-center gap-4 rounded-none border p-4 text-left",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/20 opacity-60"
      )}
    >
      <span
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-none [&_svg]:size-6",
          active
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        {icon}
      </span>
      <div>
        <p className="font-heading font-semibold text-sm">{title}</p>
        <p className={cn("text-xs font-normal", active ? "opacity-80" : "text-muted-foreground")}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function AccountSection() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);

  if (!profile) return null;

  const isFamily = profile.account_mode === ACCOUNT_MODE.FAMILY;
  const showFamilySetup = profile.account_mode === ACCOUNT_MODE.SOLO && !profile.family_id;

  return (
    <div className="space-y-8 max-w-lg" data-nimbus-tour={NIMBUS_TOUR_TARGET.SETTINGS_ACCOUNT_TYPE}>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t.account.accountTypeFixedDesc}</p>
      </div>

      <div className="grid gap-3">
        <AccountModeCard
          active={isFamily}
          icon={<Heart />}
          title={t.onboarding.familyTitle}
          description={t.onboarding.familyDesc}
        />
        <AccountModeCard
          active={!isFamily}
          icon={<User />}
          title={t.onboarding.soloTitle}
          description={t.onboarding.soloDesc}
        />
      </div>

      {showFamilySetup && (
        <>
          <CreateFamilyForm />
          <JoinFamilyForm />
        </>
      )}
    </div>
  );
}
