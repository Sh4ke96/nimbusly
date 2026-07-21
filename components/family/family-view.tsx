"use client";

import Link from "next/link";
import { ModulePageShell } from "@/components/app/module-page-shell";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { FamilySection } from "@/components/profile/settings/family-section";
import { AccountSection } from "@/components/profile/settings/account-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";

export function FamilyView() {
  const t = useT();
  const profile = useProfileStore((s) => s.profile);
  const showFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;

  return (
    <ModulePageShell>
        <AccountBreadcrumbs current={t.family.pageTitle} />

        <div className="space-y-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.FAMILY_MEMBERS}>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight">
            {t.family.pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.family.pageDesc}</p>
        </div>

        <Card className="gap-0 rounded-none py-0 shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {showFamily ? (
              <FamilySection />
            ) : (
              <div className="space-y-4 max-w-2xl">
                <p className="text-sm text-muted-foreground">{t.family.soloHint}</p>
                <AccountSection />
                <Button asChild className="rounded-none cursor-pointer">
                  <Link href="/profile/settings?tab=account">{t.family.openAccountSettings}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
    </ModulePageShell>
  );
}
