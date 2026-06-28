import { Suspense } from "react";
import { ProfileBootstrap } from "@/components/profile/profile-bootstrap";
import { NotificationsRealtimeBridge } from "@/components/notifications/notifications-realtime-bridge";
import { NimbusCompanionHost } from "@/components/nimbus/nimbus-companion-host";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PwaPushPrompt } from "@/components/pwa/pwa-push-prompt";
import { AmbientBackground } from "@/components/ui/ambient-background";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileBootstrap>
      <NotificationsRealtimeBridge />
      <div className="relative">
        <AmbientBackground variant="app" />
        <div className="relative z-10 app-mobile-bottom-inset">{children}</div>
        <NimbusCompanionHost />
        <Suspense fallback={null}>
          <MobileBottomNav />
        </Suspense>
        <PwaInstallPrompt />
        <PwaPushPrompt />
      </div>
    </ProfileBootstrap>
  );
}
