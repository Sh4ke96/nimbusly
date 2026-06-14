"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Cake,
  Cross,
  ListChecks,
  PawPrint,
} from "lucide-react";
import type { AttentionItem } from "@/lib/dashboard/attention";
import { ATTENTION_KIND } from "@/lib/dashboard/attention";
import { formatMessage } from "@/lib/i18n/format";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

function AttentionIcon({ kind }: { kind: AttentionItem["kind"] }) {
  switch (kind) {
    case ATTENTION_KIND.CHORE_OVERDUE:
      return <ListChecks className="size-4 shrink-0 text-destructive" />;
    case ATTENTION_KIND.MEDICINE_EXPIRING:
      return <Cross className="size-4 shrink-0 text-primary" />;
    case ATTENTION_KIND.PET_CARE_DUE:
      return <PawPrint className="size-4 shrink-0 text-primary" />;
    case ATTENTION_KIND.BIRTHDAY_SOON:
      return <Cake className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />;
  }
}

interface DashboardAttentionBannerProps {
  items: AttentionItem[];
}

export function DashboardAttentionBanner({ items }: DashboardAttentionBannerProps) {
  const t = useT();

  if (items.length === 0) return null;

  return (
    <section className="border border-primary/25 bg-primary/5 px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-primary" />
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          {t.dashboard.attentionHeading}
        </h2>
        <span className="text-xs text-muted-foreground">
          {formatMessage(t.dashboard.attentionCount, {
            count: String(items.length),
          })}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={`${item.kind}-${item.label}-${index}`}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-none border border-border bg-background/80 px-3 py-2 text-sm",
                "hover:border-primary/30 hover:bg-background transition-colors"
              )}
            >
              <AttentionIcon kind={item.kind} />
              <span className="truncate font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
