import type { ReactNode } from "react";
import { APP_VIEW_SHELL_CLASS } from "@/lib/ui/app-layout";
import { cn } from "@/lib/utils";

interface AppViewShellProps {
  children: ReactNode;
  className?: string;
}

export function AppViewShell({ children, className }: AppViewShellProps) {
  return <div className={cn(APP_VIEW_SHELL_CLASS, className)}>{children}</div>;
}
