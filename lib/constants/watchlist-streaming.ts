export const STREAMING_PLATFORM = {
  NETFLIX: "netflix",
  MAX: "max",
  DISNEY_PLUS: "disney_plus",
  PRIME_VIDEO: "prime_video",
  APPLE_TV: "apple_tv",
  CANAL_PLUS: "canal_plus",
  PLAYER: "player",
  POLSAT_BOX: "polsat_box",
} as const;

export const STREAMING_PLATFORMS = [
  STREAMING_PLATFORM.NETFLIX,
  STREAMING_PLATFORM.MAX,
  STREAMING_PLATFORM.DISNEY_PLUS,
  STREAMING_PLATFORM.PRIME_VIDEO,
  STREAMING_PLATFORM.APPLE_TV,
  STREAMING_PLATFORM.CANAL_PLUS,
  STREAMING_PLATFORM.PLAYER,
  STREAMING_PLATFORM.POLSAT_BOX,
] as const;

export type StreamingPlatform = (typeof STREAMING_PLATFORMS)[number];

export const STREAMING_PLATFORM_MAX_COUNT = STREAMING_PLATFORMS.length;

export interface StreamingPlatformMeta {
  id: StreamingPlatform;
  brandColor: string;
  darkText?: boolean;
  /** Tile background behind the logo (e.g. logos designed for dark backgrounds). */
  iconBackground?: string;
  /** Logo filename in public/streaming/ (default: `{id}.svg`). */
  logoFile?: string;
}

export const STREAMING_PLATFORM_META: Record<StreamingPlatform, StreamingPlatformMeta> = {
  [STREAMING_PLATFORM.NETFLIX]: { id: STREAMING_PLATFORM.NETFLIX, brandColor: "#E50914" },
  [STREAMING_PLATFORM.MAX]: {
    id: STREAMING_PLATFORM.MAX,
    brandColor: "#002BE7",
    logoFile: "hbo_max.svg",
  },
  [STREAMING_PLATFORM.DISNEY_PLUS]: {
    id: STREAMING_PLATFORM.DISNEY_PLUS,
    brandColor: "#113CCF",
  },
  [STREAMING_PLATFORM.PRIME_VIDEO]: {
    id: STREAMING_PLATFORM.PRIME_VIDEO,
    brandColor: "#00A8E1",
  },
  [STREAMING_PLATFORM.APPLE_TV]: {
    id: STREAMING_PLATFORM.APPLE_TV,
    brandColor: "#1D1D1F",
  },
  [STREAMING_PLATFORM.CANAL_PLUS]: {
    id: STREAMING_PLATFORM.CANAL_PLUS,
    brandColor: "#000000",
  },
  [STREAMING_PLATFORM.PLAYER]: { id: STREAMING_PLATFORM.PLAYER, brandColor: "#F47B20" },
  [STREAMING_PLATFORM.POLSAT_BOX]: {
    id: STREAMING_PLATFORM.POLSAT_BOX,
    brandColor: "#E30613",
    iconBackground: "#000000",
  },
};

export function getStreamingPlatformLogoSrc(platform: StreamingPlatform): string {
  const { logoFile } = STREAMING_PLATFORM_META[platform];
  return `/streaming/${logoFile ?? `${platform}.svg`}`;
}
