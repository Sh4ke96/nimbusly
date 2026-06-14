export const AVATAR_COLORS = [
  { id: "forest", value: "#2b5748" },
  { id: "sage", value: "#618764" },
  { id: "moss", value: "#9cb080" },
  { id: "slate", value: "#273338" },
  { id: "pine", value: "#3f6b58" },
  { id: "leaf", value: "#b0c79a" },
  { id: "clay", value: "#9a7b5f" },
  { id: "sea", value: "#4a7c8c" },
  { id: "terra", value: "#b86f52" },
  { id: "dusk", value: "#5c6b8a" },
  { id: "heather", value: "#7a6b8c" },
  { id: "cedar", value: "#4d6a5a" },
  { id: "sand", value: "#c4a882" },
  { id: "stone", value: "#6b7d6e" },
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number]["value"];

const validColors = new Set<AvatarColor>(AVATAR_COLORS.map((c) => c.value));

export function isAvatarColor(value: string): value is AvatarColor {
  return validColors.has(value as AvatarColor);
}

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[1].value;

export function resolveAvatarColor(color?: string | null): string {
  if (color && color.trim().length > 0) return color;
  return DEFAULT_AVATAR_COLOR;
}
