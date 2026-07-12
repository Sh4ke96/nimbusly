"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoShell } from "@/components/demo/demo-shell";
import { DEMO_ROUTE, DEMO_SECTION_ID } from "@/lib/constants/demo-mode";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";

export function DemoSection() {
  const t = useT();

  return (
    <section id={DEMO_SECTION_ID} className="scroll-mt-20 border-y border-border bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t.demo.sectionHeading}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">{t.demo.sectionSubheading}</p>
        </div>

        <DemoShell embedded />

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="outline" size="lg" className="rounded-none" asChild>
            <Link href={DEMO_ROUTE}>
              {t.demo.openFull}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" className="rounded-none" asChild>
            <Link href="/register">{t.demo.ctaBtn}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
