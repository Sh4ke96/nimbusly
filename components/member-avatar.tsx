import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR_COLOR, resolveAvatarColor } from "@/lib/avatar-colors";

type Member = "mama" | "tata" | "corka" | "syn";

const memberColors: Record<Member, string> = {
  mama: "#2b5748",
  tata: "#618764",
  corka: "#9cb080",
  syn: "#273338",
};

function getContrastColor(hexBg: string): string {
  const hex = hexBg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const luminance =
    0.2126 * (r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)) +
    0.7152 * (g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)) +
    0.0722 * (b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4));
  return luminance > 0.179 ? "#273338" : "#f6f8f2";
}

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};

interface MemberAvatarProps {
  name: string;
  member?: Member;
  color?: string;
  size?: keyof typeof sizeClasses;
  ring?: boolean;
  className?: string;
}

export function MemberAvatar({
  name,
  member,
  color,
  size = "md",
  ring = false,
  className,
}: MemberAvatarProps) {
  const bg = resolveAvatarColor(color ?? (member ? memberColors[member] : DEFAULT_AVATAR_COLOR));
  const textColor = getContrastColor(bg);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-none font-semibold font-heading shrink-0",
        sizeClasses[size],
        ring && "ring-2 ring-background ring-offset-1 ring-offset-background",
        className
      )}
      style={{ backgroundColor: bg, color: textColor }}
      title={name}
    >
      {initials}
    </span>
  );
}
