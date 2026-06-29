"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
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
    <>
      <AppHeader />
      <AppPage width="default">
        <AccountBreadcrumbs current={t.family.pageTitle} />

        <div className="space-y-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.FAMILY_MEMBERS}>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight">
            {t.family.pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.family.pageDesc}</p>
        </div>

        {showFamily ? (
          <FamilySection />
        ) : (
          <Card className="rounded-none shadow-none">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">{t.family.soloHint}</p>
              <AccountSection />
              <Button asChild className="rounded-none cursor-pointer">
                <Link href="/profile/settings?tab=account">{t.family.openAccountSettings}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </AppPage>
    </>
  );
}
