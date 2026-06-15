"use client";

import { NimbusCharacter } from "@/components/nimbus/nimbus-character";
import { useT } from "@/lib/lang-context";
import {
  BellRing,
  Compass,
  HelpCircle,
  Keyboard,
  Map,
  PartyPopper,
  Sparkles,
  VolumeX,
} from "lucide-react";

const capabilityIcons = [
  Map,
  Compass,
  HelpCircle,
  PartyPopper,
  BellRing,
  Keyboard,
  VolumeX,
  Sparkles,
];

export function NimbusLandingSection() {
  const t = useT();

  return (
    <section
      id={t.nav.nimbusSlug}
      className="scroll-mt-20 relative border-y border-border/60 bg-gradient-to-b from-primary/5 via-background to-muted/20 py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-none border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {t.nimbusLanding.badge}
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {t.nimbusLanding.heading}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.nimbusLanding.intro}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {t.nimbusLanding.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="border border-border bg-card/80 p-5 shadow-sm space-y-2"
                >
                  <h3 className="font-heading font-semibold text-foreground">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 lg:items-end">
            <div className="relative flex flex-col items-center">
              <span className="nimbus-npc-ground absolute bottom-2 h-3 w-24 rounded-full bg-black/10 blur-[2px]" aria-hidden />
              <NimbusCharacter mood="hover" size={120} />
            </div>
            <div className="w-full max-w-md border border-primary/25 bg-card/90 p-5 space-y-3">
              <p className="font-heading font-semibold text-foreground">{t.nimbusLanding.asideTitle}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.nimbusLanding.asideBullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 leading-relaxed">
                    <span className="text-primary shrink-0">·</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-6">
          <h3 className="font-heading text-xl font-semibold text-center sm:text-2xl">
            {t.nimbusLanding.capabilitiesHeading}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.nimbusLanding.capabilities.map((item, index) => {
              const Icon = capabilityIcons[index] ?? Sparkles;
              return (
                <div
                  key={item.title}
                  className="group border border-border bg-card p-5 space-y-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-none bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="size-4" />
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-heading font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
            {t.nimbusLanding.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
