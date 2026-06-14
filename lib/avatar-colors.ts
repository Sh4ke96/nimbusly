export const AVATAR_COLORS = [
  { id: "forest", value: "#2b5748" },
  { id: "sage", value: "#618764" },
  { id: "moss", value: "#9cb080" },
  { id: "slate", value: "#273338" },
  { id: "pine", value: "#3f6b58" },
  { id: "leaf", value: "#b0c79a" },
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number]["value"];

const validColors = new Set<AvatarColor>(AVATAR_COLORS.map((c) => c.value));

export function isAvatarColor(value: string): value is AvatarColor {
  return validColors.has(value as AvatarColor);
}

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[1].value;
