"use client";

import { useT } from "@/lib/lang-context";
import {
  Cake,
  CalendarDays,
  Clapperboard,
  Cross,
  Gift,
  ListChecks,
  PawPrint,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Wallet,
} from "lucide-react";

const featureIcons = [
  Wallet,
  ShoppingCart,
  Gift,
  Cake,
  CalendarDays,
  Cross,
  Clapperboard,
  UtensilsCrossed,
  PawPrint,
  ListChecks,
  Users,
];

export function FeaturesSection() {
  const t = useT();

  return (
    <section id={t.nav.featuresSlug} className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight text-balance">
            {t.features.heading}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
            {t.features.subheading}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((f, i) => {
            const Icon = featureIcons[i] ?? Wallet;
            return (
              <div
                key={f.title}
                className="group bg-card rounded-none border border-border p-6 space-y-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-200">
                  <Icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
