"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type NimbusMood = "idle" | "hover" | "calling";

interface NimbusCharacterProps {
  mood?: NimbusMood;
  size?: number;
  className?: string;
}

export function NimbusCharacter({
  mood = "idle",
  size = 72,
  className,
}: NimbusCharacterProps) {
  const uid = useId().replace(/:/g, "");
  const bodyGrad = `nimbus-body-${uid}`;
  const cheekGrad = `nimbus-cheek-${uid}`;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none",
        mood === "idle" && "nimbus-npc-idle",
        mood === "hover" && "nimbus-npc-hover",
        mood === "calling" && "nimbus-npc-calling",
        className
      )}
      style={{ width: size, height: size * 1.15 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 80 92"
        width={size}
        height={size * 1.15}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={bodyGrad} x1="40" y1="8" x2="40" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7a9f7d" />
            <stop offset="55%" stopColor="#618764" />
            <stop offset="100%" stopColor="#2B5748" />
          </linearGradient>
          <radialGradient id={cheekGrad} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6F8F2" />
            <stop offset="100%" stopColor="#e8ede0" />
          </radialGradient>
        </defs>

        {/* Feet */}
        <ellipse cx="30" cy="86" rx="7" ry="4" fill="#234539" />
        <ellipse cx="50" cy="86" rx="7" ry="4" fill="#234539" />

        {/* Body / cloud torso */}
        <path
          d="M40 18 C54 10 68 16 70 30 C80 34 82 48 74 58 C78 68 68 76 54 76 L26 76 C14 76 6 66 10 54 C4 44 8 28 22 24 C24 14 34 12 40 18 Z"
          fill={`url(#${bodyGrad})`}
        />
        <circle cx="18" cy="42" r="9" fill={`url(#${bodyGrad})`} />
        <circle cx="62" cy="42" r="9" fill={`url(#${bodyGrad})`} />

        {/* Face plate */}
        <ellipse cx="40" cy="42" rx="22" ry="20" fill={`url(#${cheekGrad})`} opacity="0.92" />

        {/* Eyes */}
        <g className="nimbus-npc-eyes">
          <ellipse cx="32" cy="40" rx="5" ry="6" fill="#F6F8F2" />
          <ellipse cx="48" cy="40" rx="5" ry="6" fill="#F6F8F2" />
          <circle cx="33" cy="41" r="2.4" fill="#1e3d32" />
          <circle cx="49" cy="41" r="2.4" fill="#1e3d32" />
          <circle cx="34" cy="39.5" r="0.8" fill="#fff" opacity="0.9" />
          <circle cx="50" cy="39.5" r="0.8" fill="#fff" opacity="0.9" />
        </g>

        {/* Smile */}
        <path
          d="M 30 50 Q 40 57 50 50"
          stroke="#2B5748"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny house emblem */}
        <g transform="translate(40 62)">
          <path d="M-8 4 L0 -5 L8 4 Z" fill="#F6F8F2" />
          <rect x="-6" y="4" width="12" height="9" rx="1" fill="#F6F8F2" />
          <rect x="-2" y="7" width="4" height="6" rx="2" fill="#618764" />
        </g>

        {/* Left arm */}
        <g className="nimbus-npc-arm-left">
          <ellipse cx="12" cy="52" rx="5" ry="7" fill={`url(#${bodyGrad})`} />
          <circle cx="9" cy="60" r="4.5" fill={`url(#${cheekGrad})`} />
        </g>

        {/* Right arm - waves on hover / calling */}
        <g className="nimbus-npc-arm-right">
          <ellipse cx="68" cy="50" rx="5" ry="7" fill={`url(#${bodyGrad})`} />
          <circle cx="71" cy="42" r="4.5" fill={`url(#${cheekGrad})`} />
        </g>
      </svg>
    </span>
  );
}
