"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag } from "lucide-react";
import { APP_VERSION } from "@/lib/changelog/entries";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface VersionBadgeProps {
  className?: string;
}

export function VersionBadge({ className }: VersionBadgeProps) {
  const t = useT();
  const pathname = usePathname();

  if (pathname === "/change-log") return null;

  return (
    <Link
      href="/change-log"
      className={cn(
        "fixed bottom-3 right-3 z-30 max-md:hidden",
        "inline-flex items-center gap-1.5",
        "rounded-none border border-border/80 bg-card/90 px-2 py-1.5 shadow-sm backdrop-blur-sm",
        "font-mono text-[11px] font-medium text-muted-foreground",
        "transition-colors hover:border-primary/35 hover:bg-card hover:text-foreground",
        className
      )}
      aria-label={t.changeLog.versionBadgeAria}
    >
      <Tag className="size-3.5 shrink-0 text-primary/80" aria-hidden />
      <span>v{APP_VERSION}</span>
    </Link>
  );
}
