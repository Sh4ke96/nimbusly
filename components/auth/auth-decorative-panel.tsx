"use client";

import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { FloatingModulePills } from "@/components/ui/floating-module-pills";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

export function AuthDecorativePanel({ className }: { className?: string }) {
  const t = useT();

  return (
    <div className={cn("relative flex flex-1 flex-col justify-center space-y-6 pr-6 animate-rise", className)}>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-none border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary">
        <Sparkles className="size-3.5" />
        {t.hero.badge}
      </span>

      <div className="space-y-3">
        <h2 className="font-heading font-bold text-3xl tracking-tight text-balance leading-tight">
          {t.authDecor.headline}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md text-pretty">
          {t.authDecor.desc}
        </p>
      </div>

      <div className="relative mt-2 h-80 w-full max-w-lg overflow-hidden">
        <div className="absolute inset-0 rounded-none border border-primary/20 bg-linear-to-br from-primary/8 via-card/40 to-accent/6 backdrop-blur-sm" />
        <div
          className="absolute -top-8 -right-8 size-32 rounded-full border-2 border-primary/20 ambient-shape"
          style={{ "--shape-duration": "20s", "--shape-delay": "0s" } as CSSProperties}
        />
        <FloatingModulePills />
      </div>
    </div>
  );
}
