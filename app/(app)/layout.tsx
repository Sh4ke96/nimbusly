import { ProfileBootstrap } from "@/components/profile/profile-bootstrap";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProfileBootstrap>{children}</ProfileBootstrap>;
}
