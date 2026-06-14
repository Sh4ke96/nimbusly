"use client";

import { useLang } from "@/lib/lang-context";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HEADER_CONTROL_HEIGHT } from "@/lib/ui/header-controls";
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
      spacing={0}
      className={cn(
        HEADER_CONTROL_HEIGHT,
        "items-stretch rounded-none border border-border border-l-0 bg-muted/50 p-0 font-heading text-xs font-semibold",
        "hover:border-primary/40",
        className
      )}
    >
      {(["pl", "en"] as const).map((l) => (
        <ToggleGroupItem
          key={l}
          value={l}
          className="h-full min-h-0 rounded-none border-0 px-2.5 py-0 shadow-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {l.toUpperCase()}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
