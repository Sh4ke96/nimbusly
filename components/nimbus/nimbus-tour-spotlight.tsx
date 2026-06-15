"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface NimbusTourSpotlightProps {
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  dimmed?: boolean;
  onDismiss: () => void;
}

export function NimbusTourSpotlight({ rect, dimmed, onDismiss }: NimbusTourSpotlightProps) {
  const maskId = useId().replace(/:/g, "");

  return (
    <>
      <svg
        className={cn(
          "absolute inset-0 size-full pointer-events-auto transition-opacity duration-300",
          dimmed && "opacity-65"
        )}
        onClick={onDismiss}
        aria-hidden
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              className="nimbus-tour-mask-hole"
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          className="nimbus-tour-dim"
          mask={`url(#${maskId})`}
        />
      </svg>

      <div
        className="nimbus-tour-ring pointer-events-none absolute"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
        aria-hidden
      />
    </>
  );
}
