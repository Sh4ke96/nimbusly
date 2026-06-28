"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { APP_VERSION } from "@/lib/changelog/entries";
import { useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

interface AppVersionFooterProps {
  className?: string;
}

export function AppVersionFooter({ className }: AppVersionFooterProps) {
  const t = useT();

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 border-t border-border pt-4 text-center sm:flex-row sm:justify-between sm:text-left",
        className
      )}
    >
      <p className="text-xs text-muted-foreground">{t.account.appVersionHint}</p>
      <Link
        href="/change-log"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border border-border/80 bg-muted/40 px-2.5 py-1.5",
          "font-mono text-[11px] font-medium text-muted-foreground",
          "transition-colors hover:border-primary/35 hover:bg-muted/70 hover:text-foreground"
        )}
        aria-label={t.changeLog.versionBadgeAria}
      >
        <Tag className="size-3.5 shrink-0 text-primary/80" aria-hidden />
        <span>{formatMessage(t.account.appVersionLabel, { version: APP_VERSION })}</span>
      </Link>
    </div>
  );
}
