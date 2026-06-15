import {
  STREAMING_PLATFORMS,
  type StreamingPlatform,
} from "@/lib/constants/watchlist-streaming";

export function isValidStreamingPlatform(value: string): value is StreamingPlatform {
  return STREAMING_PLATFORMS.includes(value as StreamingPlatform);
}

export function normalizeStreamingPlatforms(values: unknown): StreamingPlatform[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<StreamingPlatform>();
  for (const value of values) {
    if (typeof value !== "string" || !isValidStreamingPlatform(value)) continue;
    seen.add(value);
  }

  return STREAMING_PLATFORMS.filter((platform) => seen.has(platform));
}

export function parseStreamingPlatformsJson(raw: string): StreamingPlatform[] | null {
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return normalizeStreamingPlatforms(parsed);
  } catch {
    return null;
  }
}

export function streamingPlatformsEqual(
  a: StreamingPlatform[],
  b: StreamingPlatform[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every((platform, index) => platform === b[index]);
}

export function formatStreamingPlatformList(
  platforms: StreamingPlatform[],
  labels: Record<StreamingPlatform, string>,
  separator: string
): string {
  return platforms.map((platform) => labels[platform]).join(separator);
}
