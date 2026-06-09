"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CtaSection() {
  const t = useT();

  return (
    <section id={t.nav.forFamilySlug} className="pb-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl bg-primary p-10 md:p-14 text-center space-y-6">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-primary-foreground tracking-tight text-balance">
            {t.cta.heading}
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">{t.cta.desc}</p>
          <Button
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            asChild
          >
            <Link href="/register">
              {t.cta.btn}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/70">
            {t.cta.perks.map((perk) => (
              <span key={perk} className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                {perk}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
