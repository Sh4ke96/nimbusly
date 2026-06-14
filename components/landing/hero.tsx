"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/member-avatar";
import { HeroModulePills } from "@/components/landing/hero-module-pills";
import { useT } from "@/lib/lang-context";
import { ArrowRight, Star, Sparkles } from "lucide-react";

export function HeroSection() {
  const t = useT();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-[600px] rounded-none bg-primary/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-48 -left-48 size-[480px] rounded-none bg-accent/8 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-16 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_52%] lg:gap-12">
          <div className="space-y-8 animate-rise lg:pr-8">
            <span className="inline-flex items-center gap-1.5 rounded-none border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-3.5" />
              {t.hero.badge}
            </span>

            <div className="space-y-5">
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.12] tracking-tight text-balance">
                {t.hero.headline.split(t.hero.headlineAccent)[0]}
                <span className="text-primary">{t.hero.headlineAccent}</span>
                {t.hero.headline.split(t.hero.headlineAccent)[1]}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md text-pretty">
                {t.hero.desc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`#${t.nav.featuresSlug}`}>{t.hero.ctaSecondary}</Link>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {t.hero.demoAvatars.map((a) => (
                  <MemberAvatar key={a.name} name={a.name} member={a.member} size="sm" ring />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold font-heading text-foreground">
                  {t.hero.socialProofCount}
                </span>{" "}
                <span className="text-muted-foreground">{t.hero.socialProofLabel}</span>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-xs">{t.hero.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-pop">
            <div className="relative overflow-hidden">
              <Image
                src="/hero-room.png"
                alt={t.hero.imageAlt}
                width={620}
                height={620}
                className="w-full h-auto object-cover"
                priority
              />
              <HeroModulePills />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
