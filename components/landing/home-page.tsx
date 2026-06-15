"use client";

import { SiteNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { HighlightsSection } from "@/components/landing/highlights";
import { FeaturesSection } from "@/components/landing/features";
import { NimbusLandingSection } from "@/components/landing/nimbus";
import { StepsSection } from "@/components/landing/steps";
import { CtaSection } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col text-foreground">
      <AmbientBackground variant="landing" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <HeroSection />
          <HighlightsSection />
          <FeaturesSection />
          <NimbusLandingSection />
          <StepsSection />
          <CtaSection />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
