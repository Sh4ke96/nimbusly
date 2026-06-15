import {
  getStreamingPlatformLogoSrc,
  STREAMING_PLATFORM_META,
  type StreamingPlatform,
} from "@/lib/constants/watchlist-streaming";
import { cn } from "@/lib/utils";

interface StreamingPlatformIconProps {
  platform: StreamingPlatform;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "size-9",
  md: "size-11",
} as const;

export function StreamingPlatformIcon({
  platform,
  size = "md",
  className,
}: StreamingPlatformIconProps) {
  const iconBackground = STREAMING_PLATFORM_META[platform].iconBackground;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-none border border-border shadow-sm",
        iconBackground ? null : "bg-card",
        sizeClasses[size],
        className
      )}
      style={iconBackground ? { backgroundColor: iconBackground } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getStreamingPlatformLogoSrc(platform)}
        alt=""
        aria-hidden
        className="size-full object-contain p-px"
      />
    </span>
  );
}
