"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Palette, User, Users } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile/settings/profile-form";
import { AccountTypeForm } from "@/components/profile/settings/account-type-form";
import { FamilySection } from "@/components/profile/settings/family-section";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";

const TABS = ["profile", "account", "family"] as const;
type SettingsTab = (typeof TABS)[number];

function parseTab(value: string | null): SettingsTab {
  if (value === "account" || value === "family") return value;
  return "profile";
}

export default function ProfileSettingsPage() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useProfileStore((s) => s.profile);

  const tab = parseTab(searchParams.get("tab"));
  const showFamily = profile?.account_mode === "family" && !!profile.family_id;

  function onTabChange(value: string) {
    router.push(`/profile/settings?tab=${value}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t.account.settingsBack}
        </Link>

        <div className="space-y-1">
          <h1 className="font-heading font-bold text-2xl tracking-tight">
            {t.account.settingsTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.account.settingsSubtitle}</p>
        </div>

        <Card className="rounded-none shadow-sm">
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={onTabChange} className="gap-6">
              <TabsList
                variant="line"
                className="w-full justify-start rounded-none border-b border-border pb-0 h-auto flex-wrap gap-0"
              >
                <TabsTrigger
                  value="profile"
                  className="rounded-none gap-1.5 px-4 py-2.5 data-active:after:opacity-100"
                >
                  <Palette className="size-4" />
                  {t.account.menuProfile}
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="rounded-none gap-1.5 px-4 py-2.5 data-active:after:opacity-100"
                >
                  <User className="size-4" />
                  {t.account.menuAccountType}
                </TabsTrigger>
                {showFamily && (
                  <TabsTrigger
                    value="family"
                    className="rounded-none gap-1.5 px-4 py-2.5 data-active:after:opacity-100"
                  >
                    <Users className="size-4" />
                    {t.account.menuFamily}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="profile" className="pt-6">
                <ProfileForm />
              </TabsContent>

              <TabsContent value="account" className="pt-6">
                <AccountTypeForm />
              </TabsContent>

              {showFamily && (
                <TabsContent value="family" className="pt-6">
                  <FamilySection />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
