import { cn } from "@/lib/utils";

interface NimbusIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function NimbusIcon({ size = 36, className, animated = false }: NimbusIconProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-none",
        animated && "nimbus-companion-float",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="nimbus-icon-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#618764" />
            <stop offset="100%" stopColor="#2B5748" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="128" ry="128" fill="url(#nimbus-icon-bg)" />
        <path d="M256 104 L424 234 L424 422 L88 422 L88 234 Z" fill="#F6F8F2" />
        <polygon points="256,76 448,242 64,242" fill="#F6F8F2" />
        <rect x="216" y="312" width="80" height="110" rx="40" ry="40" fill="#2B5748" />
        <path
          className={cn(animated && "icon-float")}
          d="M256 202 C256 202 230 180 217 191 C204 202 204 222 217 234 L256 268 L295 234 C308 222 308 202 295 191 C282 180 256 202 256 202 Z"
          fill="#618764"
        />
      </svg>
    </span>
  );
}
