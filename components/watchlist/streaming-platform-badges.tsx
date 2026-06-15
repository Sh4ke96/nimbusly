"use client";

import { StreamingPlatformIcon } from "@/components/watchlist/streaming-platform-icon";
import type { StreamingPlatform } from "@/lib/constants/watchlist-streaming";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useT } from "@/lib/lang-context";

interface StreamingPlatformBadgesProps {
  platforms: StreamingPlatform[];
}

export function StreamingPlatformBadges({ platforms }: StreamingPlatformBadgesProps) {
  const t = useT();

  if (platforms.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2.5">
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t.watchlist.streamingPlatformsOnCard}
          </span>
          {platforms.map((platform) => (
          <Tooltip key={platform}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <StreamingPlatformIcon
                  platform={platform}
                  size="sm"
                  className="cursor-default"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {t.watchlist.streamingPlatformLabels[platform]}
            </TooltipContent>
          </Tooltip>
        ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
