"use client";

import { useT } from "@/lib/lang-context";
import { Bell, Globe, LayoutDashboard, Radio } from "lucide-react";

const highlightIcons = [LayoutDashboard, Bell, Radio, Globe];

export function HighlightsSection() {
  const t = useT();

  return (
    <section className="border-y border-border/60 bg-card/40 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.highlights.items.map((item, i) => {
            const Icon = highlightIcons[i] ?? LayoutDashboard;
            return (
              <div key={item.title} className="flex gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-sm leading-snug">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
