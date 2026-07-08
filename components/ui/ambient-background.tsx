import type { AmbientVariant } from "@/lib/constants/ambient-decor";
import type { CSSProperties } from "react";
import { AmbientIconField } from "@/components/ui/ambient-icon-field";
import { AmbientShapes } from "@/components/ui/ambient-shapes";
import { cn } from "@/lib/utils";

type AmbientBackgroundProps = {
  variant?: AmbientVariant;
  className?: string;
};

export function AmbientBackground({ variant = "app", className }: AmbientBackgroundProps) {
  const isRich = variant === "auth" || variant === "landing";

  return (
    <div
      aria-hidden
      className={cn(
        "ambient-background-root pointer-events-none fixed inset-0 z-0 overflow-hidden",
        variant === "app" && "ambient-lite",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          isRich
            ? "bg-linear-to-br from-primary/8 via-background to-accent/6"
            : "bg-linear-to-br from-primary/5 via-background to-accent/4"
        )}
      />

      <div className="ambient-grid absolute inset-0" />
      <div className="ambient-rays absolute inset-0" />

      <AmbientShapes variant={variant} />
      <AmbientIconField variant={variant} />

      <div
        className={cn(
          "ambient-blob absolute -top-32 -right-32 size-[640px] rounded-full blur-3xl",
          isRich ? "bg-primary/18 dark:bg-primary/14" : "bg-primary/12 dark:bg-primary/10"
        )}
        style={
          {
            "--blob-duration": "22s",
            "--blob-delay": "0s",
          } as CSSProperties
        }
      />
      <div
        className={cn(
          "ambient-blob absolute top-1/4 -left-56 size-[520px] rounded-full blur-3xl",
          isRich ? "bg-accent/20 dark:bg-accent/14" : "bg-accent/12 dark:bg-accent/8"
        )}
        style={
          {
            "--blob-duration": "26s",
            "--blob-delay": "-4s",
          } as CSSProperties
        }
      />
      <div
        className={cn(
          "ambient-blob absolute -bottom-40 right-[10%] size-[480px] rounded-full blur-3xl",
          isRich ? "bg-primary/14" : "bg-primary/10"
        )}
        style={
          {
            "--blob-duration": "20s",
            "--blob-delay": "-8s",
          } as CSSProperties
        }
      />
      <div
        className={cn(
          "ambient-blob absolute top-[55%] left-[30%] size-[360px] rounded-full blur-3xl",
          isRich ? "bg-muted/50 dark:bg-muted/25" : "bg-muted/35 dark:bg-muted/15"
        )}
        style={
          {
            "--blob-duration": "24s",
            "--blob-delay": "-2s",
          } as CSSProperties
        }
      />
    </div>
  );
}
