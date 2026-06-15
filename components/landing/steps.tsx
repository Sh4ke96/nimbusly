"use client";

import { useT } from "@/lib/lang-context";

export function StepsSection() {
  const t = useT();

  return (
    <section id={t.nav.howItWorksSlug} className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tight text-balance">
            {t.steps.heading}
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {t.steps.items.map((s) => (
            <div key={s.step} className="space-y-4 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-none bg-primary/10 font-heading font-bold text-xl text-primary">
                {s.step}
              </span>
              <div className="space-y-1">
                <h3 className="font-heading font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
