"use client";

import { useLang } from "@/lib/lang-context";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <ToggleGroup
      type="single"
      value={lang}
      onValueChange={(value) => value && setLang(value as "pl" | "en")}
      variant="outline"
      size="sm"
      className={cn(
        "rounded-none border border-border bg-muted/50 p-0.5 font-heading text-xs font-semibold",
        "hover:border-primary/40",
        className
      )}
    >
      {(["pl", "en"] as const).map((l) => (
        <ToggleGroupItem
          key={l}
          value={l}
          className="rounded-none px-2.5 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {l.toUpperCase()}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
