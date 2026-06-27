import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 48, text: "text-2xl" },
};

export function Logo({
  showWordmark = true,
  className,
  size = "md",
  href = "/",
}: LogoProps) {
  const { icon: iconSize, text: textClass } = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5 group leading-none", className)}>
      {/* Icon */}
      <span
        className="relative shrink-0 rounded-none overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 512 512"
          width={iconSize}
          height={iconSize}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#618764" />
              <stop offset="100%" stopColor="#2B5748" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="128" ry="128" fill="url(#logo-bg)" />
          {/* House body */}
          <path d="M256 104 L424 234 L424 422 L88 422 L88 234 Z" fill="#F6F8F2" />
          {/* Roof */}
          <polygon points="256,76 448,242 64,242" fill="#F6F8F2" />
          {/* Door */}
          <rect x="216" y="312" width="80" height="110" rx="40" ry="40" fill="#2B5748" />
          {/* Heart window — floats on hover via group */}
          <path
            className="group-hover:icon-float"
            d="M256 202 C256 202 230 180 217 191 C204 202 204 222 217 234 L256 268 L295 234 C308 222 308 202 295 191 C282 180 256 202 256 202 Z"
            fill="#618764"
          />
        </svg>
      </span>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            "font-heading font-bold tracking-tight text-foreground leading-none",
            textClass
          )}
        >
          Nimbusly
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center shrink-0">
        {content}
      </Link>
    );
  }
  return content;
}
