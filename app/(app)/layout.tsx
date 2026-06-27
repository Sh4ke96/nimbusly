import { Suspense } from "react";
import { ProfileBootstrap } from "@/components/profile/profile-bootstrap";
import { NimbusCompanionHost } from "@/components/nimbus/nimbus-companion-host";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { AmbientBackground } from "@/components/ui/ambient-background";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileBootstrap>
      <div className="relative">
        <AmbientBackground variant="app" />
        <div className="relative z-10 app-mobile-bottom-inset">{children}</div>
        <NimbusCompanionHost />
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>
        <PwaInstallPrompt />
      </div>
    </ProfileBootstrap>
  );
}
