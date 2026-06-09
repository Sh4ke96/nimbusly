"use client";

import { useLang } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border bg-muted/50 px-1 py-0.5",
        "text-xs font-semibold font-heading",
        "transition-all duration-200 hover:border-primary/40",
        className
      )}
    >
      {(["pl", "en"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "cursor-pointer rounded-full px-2.5 py-1 transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : [
                    "text-muted-foreground",
                    "hover:bg-primary/10 hover:text-primary hover:scale-105",
                    "active:scale-95",
                  ]
            )}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
