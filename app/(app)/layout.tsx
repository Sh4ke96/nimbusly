import { ProfileBootstrap } from "@/components/profile/profile-bootstrap";
import { NotificationsRealtimeBridge } from "@/components/notifications/notifications-realtime-bridge";
import { NimbusCompanionHostLazy } from "@/components/nimbus/nimbus-companion-host-lazy";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { PwaInstallPromptLazy } from "@/components/pwa/pwa-install-prompt-lazy";
import { PwaPushPromptLazy } from "@/components/pwa/pwa-push-prompt-lazy";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { NavigationTransition } from "@/components/app/navigation-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileBootstrap>
      <NotificationsRealtimeBridge />
      <div className="relative">
        <AmbientBackground variant="app" />
        <div className="relative z-10 app-mobile-bottom-inset">{children}</div>
        <PwaInstallPromptLazy />
        <PwaPushPromptLazy />
        <NavigationTransition />
      </div>
      <NimbusCompanionHostLazy />
      <MobileBottomNav />
    </ProfileBootstrap>
  );
}
