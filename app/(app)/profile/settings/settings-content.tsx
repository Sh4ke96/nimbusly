"use client";

import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, ListChecks, Palette, User, Users, type LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile/settings/profile-form";
import { AccountSection } from "@/components/profile/settings/account-section";
import { FamilySection } from "@/components/profile/settings/family-section";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { ShoppingCategoriesSection } from "@/components/profile/settings/shopping-categories-section";
import { PasswordSection } from "@/components/profile/settings/password-section";
import { SettingsTabHeader } from "@/components/profile/settings/settings-tab-header";
import { SettingsSkeleton } from "@/components/profile/settings/settings-skeleton";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useT } from "@/lib/lang-context";
import { isFamilyFounder } from "@/lib/profile/family-roles";
import { cn } from "@/lib/utils";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  parseSettingsTab,
  settingsTabHref,
  SETTINGS_TAB,
  type SettingsTab,
} from "@/lib/profile/settings-tabs";
import { NIMBUS_SETTINGS_TAB_EVENT } from "@/lib/constants/nimbus";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";

const SIDEBAR_TRIGGER_CLASS = cn(
  "w-full flex-none justify-start gap-3 rounded-none border border-transparent px-4 py-3.5",
  "text-sm font-heading font-semibold text-muted-foreground",
  "hover:bg-muted/60 hover:text-foreground",
  "data-active:border-primary data-active:bg-primary/10 data-active:text-primary",
  "after:hidden"
);

export default function ProfileSettingsPage() {
  const t = useT();
  const searchParams = useSearchParams();
  const user = useProfileStore((s) => s.user);
  const family = useProfileStore((s) => s.family);
  const loaded = useProfileStore((s) => s.loaded);
  const profile = useProfileStore((s) => s.profile);

  const showFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const showShoppingCategories = showFamily && isFamilyFounder(family, user?.id);

  const urlTab = parseSettingsTab(searchParams.get("tab"));
  const [tab, setTab] = useState<SettingsTab>(urlTab);

  const navItems: { value: SettingsTab; icon: LucideIcon; label: string }[] = [
    { value: SETTINGS_TAB.PROFILE, icon: Palette, label: t.account.menuProfile },
    { value: SETTINGS_TAB.ACCOUNT, icon: User, label: t.account.menuAccountType },
    ...(showFamily
      ? [{ value: SETTINGS_TAB.FAMILY, icon: Users, label: t.account.menuFamily }]
      : []),
    ...(showShoppingCategories
      ? [
          {
            value: SETTINGS_TAB.SHOPPING_CATEGORIES,
            icon: ListChecks,
            label: t.account.menuShoppingCategories,
          },
        ]
      : []),
    { value: SETTINGS_TAB.PASSWORD, icon: KeyRound, label: t.account.menuPassword },
  ];

  const activeNav = navItems.find((item) => item.value === tab) ?? navItems[0];

  useEffect(() => {
    setTab(urlTab);
  }, [urlTab]);

  useEffect(() => {
    if (!loaded) return;
    const rawTab = searchParams.get("tab");
    if (rawTab === SETTINGS_TAB.PERMISSIONS) {
      window.history.replaceState(window.history.state, "", settingsTabHref(SETTINGS_TAB.FAMILY));
    }
  }, [loaded, searchParams]);

  useEffect(() => {
    if (!loaded) return;
    if (
      (tab === SETTINGS_TAB.FAMILY || tab === SETTINGS_TAB.SHOPPING_CATEGORIES) &&
      !showFamily
    ) {
      setTab(SETTINGS_TAB.PROFILE);
      window.history.replaceState(window.history.state, "", settingsTabHref(SETTINGS_TAB.PROFILE));
    }
  }, [tab, showFamily, loaded]);

  useEffect(() => {
    if (!loaded) return;
    if (tab === SETTINGS_TAB.SHOPPING_CATEGORIES && !showShoppingCategories) {
      setTab(SETTINGS_TAB.PROFILE);
      window.history.replaceState(window.history.state, "", settingsTabHref(SETTINGS_TAB.PROFILE));
    }
  }, [tab, showShoppingCategories, loaded]);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      setTab(parseSettingsTab(params.get("tab")));
    }

    function onSettingsTab(event: Event) {
      const next = parseSettingsTab((event as CustomEvent<string>).detail);
      setTab(next);
    }

    window.addEventListener("popstate", onPopState);
    window.addEventListener(NIMBUS_SETTINGS_TAB_EVENT, onSettingsTab);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener(NIMBUS_SETTINGS_TAB_EVENT, onSettingsTab);
    };
  }, []);

  function onTabChange(value: string) {
    const next = parseSettingsTab(value);
    setTab(next);
    window.history.replaceState(window.history.state, "", settingsTabHref(next));
  }

  if (!loaded) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="full">
        <AccountBreadcrumbs current={t.account.settingsTitle} />

        <div className="space-y-1">
          <h1 className="font-heading font-bold text-2xl tracking-tight">
            {t.account.settingsTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.account.settingsSubtitle}</p>
        </div>

        <Card className="gap-0 rounded-none py-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Tabs
              orientation="vertical"
              value={tab}
              onValueChange={onTabChange}
              className="w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)]">
                <aside
                  className="border-b border-border bg-muted/30 md:border-b-0 md:border-r"
                  data-nimbus-tour={NIMBUS_TOUR_TARGET.SETTINGS_NAV}
                >
                  <TabsList
                    variant="line"
                    className="flex h-auto w-full flex-row md:flex-col items-stretch gap-0 overflow-x-auto rounded-none border-0 bg-transparent p-2 md:overflow-visible"
                  >
                    {navItems.map(({ value, icon: Icon, label }, index) => (
                      <Fragment key={value}>
                        {index > 0 && <Separator className="hidden md:block" />}
                        <TabsTrigger
                          value={value}
                          className={cn(
                            SIDEBAR_TRIGGER_CLASS,
                            "md:w-full shrink-0 md:shrink min-w-[9.5rem] md:min-w-0"
                          )}
                          data-nimbus-tour={
                            value === SETTINGS_TAB.FAMILY
                              ? NIMBUS_TOUR_TARGET.FAMILY_SETTINGS_TAB
                              : undefined
                          }
                        >
                          <Icon className="size-5 shrink-0" />
                          <span className="text-left">{label}</span>
                        </TabsTrigger>
                      </Fragment>
                    ))}
                  </TabsList>
                </aside>

                <div className="min-w-0 p-4 sm:p-6 md:p-8">
                  <SettingsTabHeader icon={activeNav.icon} title={activeNav.label} />

                  <TabsContent value={SETTINGS_TAB.PROFILE} className="mt-0 outline-none">
                    <ProfileForm />
                  </TabsContent>

                  <TabsContent value={SETTINGS_TAB.ACCOUNT} className="mt-0 outline-none">
                    <AccountSection />
                  </TabsContent>

                  {showFamily && (
                    <>
                      <TabsContent value={SETTINGS_TAB.FAMILY} className="mt-0 outline-none">
                        <FamilySection />
                      </TabsContent>
                      {showShoppingCategories ? (
                        <TabsContent
                          value={SETTINGS_TAB.SHOPPING_CATEGORIES}
                          className="mt-0 outline-none"
                        >
                          <NimbusTourToolbarAnchor
                            tourTarget={NIMBUS_TOUR_TARGET.SETTINGS_SHOPPING_CATEGORIES}
                            visible={showShoppingCategories}
                          >
                            <ShoppingCategoriesSection />
                          </NimbusTourToolbarAnchor>
                        </TabsContent>
                      ) : null}
                    </>
                  )}

                  <TabsContent
                    value={SETTINGS_TAB.PASSWORD}
                    className="mt-0 outline-none"
                    data-nimbus-tour={NIMBUS_TOUR_TARGET.SETTINGS_PASSWORD}
                  >
                    <PasswordSection />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </AppPage>
    </div>
  );
}
