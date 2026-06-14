import { ProfileBootstrap } from "@/components/profile/profile-bootstrap";
import { AmbientBackground } from "@/components/ui/ambient-background";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileBootstrap>
      <div className="relative min-h-screen">
        <AmbientBackground variant="app" />
        <div className="relative z-10">{children}</div>
      </div>
    </ProfileBootstrap>
  );
}
