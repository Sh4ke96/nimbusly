"use client";

import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";

interface BudgetResponsiveChartProps {
  className?: string;
  children: ReactElement<{ width?: number; height?: number }>;
}

type ChartSize = { width: number; height: number };

function readSize(element: HTMLElement): ChartSize | null {
  const { width, height } = element.getBoundingClientRect();
  const nextWidth = Math.floor(width);
  const nextHeight = Math.floor(height);
  if (nextWidth <= 0 || nextHeight <= 0) return null;
  return { width: nextWidth, height: nextHeight };
}

/** Renders Recharts only after the container has measurable dimensions. */
export function BudgetResponsiveChart({ className, children }: BudgetResponsiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ChartSize | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const syncSize = () => {
      const next = readSize(element);
      if (!next) return;
      setSize((current) =>
        current?.width === next.width && current?.height === next.height ? current : next
      );
    };

    syncSize();
    const frame = requestAnimationFrame(syncSize);

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(syncSize);
    });
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("h-full w-full min-h-0 min-w-0", className)}>
      {size
        ? cloneElement(children, { width: size.width, height: size.height })
        : null}
    </div>
  );
}
