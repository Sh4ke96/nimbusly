"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronUp, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import {
  ATTENTION_KIND_ICON,
  isPinnedAttentionItem,
  type AttentionItem,
} from "@/lib/dashboard/attention";
import { formatMessage } from "@/lib/i18n/format";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

const ATTENTION_PREVIEW_LIMIT = 8;

function AttentionModuleIcon({ kind }: { kind: AttentionItem["kind"] }) {
  const Icon = ATTENTION_KIND_ICON[kind];
  return <Icon className="size-4 shrink-0 text-attention" aria-hidden />;
}

interface DashboardAttentionBannerProps {
  items: AttentionItem[];
  pinnedKeys: string[];
  onTogglePin: (pinKey: string) => void;
}

export function DashboardAttentionBanner({
  items,
  pinnedKeys,
  onTogglePin,
}: DashboardAttentionBannerProps) {
  const t = useT();
  const [expanded, setExpanded] = useState<boolean>(false);

  if (items.length === 0) return null;

  const hasMore = items.length > ATTENTION_PREVIEW_LIMIT;
  const visibleItems = expanded ? items : items.slice(0, ATTENTION_PREVIEW_LIMIT);
  const hiddenCount = items.length - ATTENTION_PREVIEW_LIMIT;

  return (
    <section className="border border-attention/30 bg-attention/8 px-4 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-attention" />
        <h2 className="font-heading text-sm font-semibold tracking-tight text-attention">
          {t.dashboard.attentionHeading}
        </h2>
        <span className="text-xs text-attention/80">
          {formatMessage(t.dashboard.attentionCount, {
            count: String(items.length),
          })}
        </span>
      </div>
      <ul className="space-y-1.5">
        {visibleItems.map((item, index) => {
          const pinned = isPinnedAttentionItem(item, pinnedKeys);
          return (
            <li key={item.pinKey} className="flex items-stretch gap-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-none border px-3 py-2 text-sm transition-colors",
                  pinned
                    ? "border-attention/50 bg-attention/15 ring-1 ring-attention/30 hover:bg-attention/20"
                    : "border-border bg-background/80 hover:border-attention/35 hover:bg-background"
                )}
              >
                <AttentionModuleIcon kind={item.kind} />
                {pinned && (
                  <Pin
                    className="size-3.5 shrink-0 fill-current text-attention"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "min-w-0 truncate",
                    pinned ? "font-semibold text-foreground" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
                {pinned && (
                  <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-attention">
                    {t.dashboard.attentionPinnedBadge}
                  </span>
                )}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-nimbus-tour={index === 0 ? NIMBUS_TOUR_TARGET.DASHBOARD_ATTENTION_PIN : undefined}
                className={cn(
                  "size-9 shrink-0 rounded-none",
                  pinned && "text-attention hover:text-attention"
                )}
                onClick={() => onTogglePin(item.pinKey)}
                aria-label={pinned ? t.dashboard.attentionUnpin : t.dashboard.attentionPin}
                aria-pressed={pinned}
              >
                <Pin className={cn("size-4", pinned && "fill-current")} />
              </Button>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3.5 mr-1" />
              {t.dashboard.attentionShowLess}
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5 mr-1" />
              {formatMessage(t.dashboard.attentionShowMore, {
                count: String(hiddenCount),
              })}
            </>
          )}
        </Button>
      )}
    </section>
  );
}
