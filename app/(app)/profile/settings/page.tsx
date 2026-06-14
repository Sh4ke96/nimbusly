import { Suspense } from "react";
import ProfileSettingsPage from "./settings-content";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProfileSettingsPage />
    </Suspense>
  );
}
