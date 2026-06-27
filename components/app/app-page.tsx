import type { ReactNode } from "react";
import { appPageClass, type AppPageWidth } from "@/lib/ui/app-layout";

interface AppPageProps {
  children: ReactNode;
  width?: AppPageWidth;
  className?: string;
}

export function AppPage({
  children,
  width = "default",
  className,
}: AppPageProps) {
  return <main className={appPageClass(width, { className })}>{children}</main>;
}
