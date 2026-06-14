import type { CSSProperties } from "react";
import type { AmbientShapeConfig, AmbientVariant } from "@/lib/constants/ambient-decor";
import { getAmbientShapes } from "@/lib/constants/ambient-decor";

function HouseOutline({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M32 10 L56 28 L56 54 L8 54 L8 28 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <path d="M32 6 L60 30 L60 32 L4 32 L4 30 Z" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="38" width="12" height="16" stroke="currentColor" strokeWidth="2" />
      <path
        d="M32 24 C32 24 28 22 26 24 C24 26 24 29 26 31 L32 36 L38 31 C40 29 40 26 38 24 C36 22 32 24 32 24 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

function HeartOutline({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className="text-primary"
    >
      <path
        d="M16 27 C16 27 4 19 4 11 C4 7 7 4 11 4 C13.5 4 15.5 5.5 16 7.5 C16.5 5.5 18.5 4 21 4 C25 4 28 7 28 11 C28 19 16 27 16 27 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

function ShapeBody({ shape }: { shape: AmbientShapeConfig }) {
  const { kind, size } = shape;

  if (kind === "ring") {
    return (
      <div
        className="rounded-full border-2 border-primary/40 dark:border-primary/30"
        style={{ width: size, height: size }}
      />
    );
  }

  if (kind === "square") {
    return (
      <div
        className="border-2 border-primary/35 dark:border-primary/25 bg-primary/5"
        style={{ width: size, height: size }}
      />
    );
  }

  if (kind === "dash") {
    return (
      <div
        className="border-t-2 border-dashed border-primary/30"
        style={{ width: size }}
      />
    );
  }

  if (kind === "house") return <HouseOutline size={size} />;
  return <HeartOutline size={size} />;
}

type AmbientShapesProps = {
  variant?: AmbientVariant;
};

export function AmbientShapes({ variant = "app" }: AmbientShapesProps) {
  const shapes = getAmbientShapes(variant);

  return (
    <>
      {shapes.map((shape) => {
        const style = {
          top: shape.top,
          left: shape.left,
          right: shape.right,
          bottom: shape.bottom,
          "--shape-duration": shape.duration,
          "--shape-delay": shape.delay,
        } as CSSProperties;

        return (
          <div key={shape.id} className="ambient-shape absolute" style={style}>
            <div style={{ transform: `rotate(${shape.rotate}deg)`, opacity: shape.opacity }}>
              <ShapeBody shape={shape} />
            </div>
          </div>
        );
      })}
    </>
  );
}
