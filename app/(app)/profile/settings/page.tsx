import { Suspense } from "react";
import ProfileSettingsPage from "./settings-content";
import { SettingsSkeleton } from "@/components/profile/settings/settings-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <ProfileSettingsPage />
    </Suspense>
  );
}
