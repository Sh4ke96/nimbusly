"use client";

import { SiteNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { StepsSection } from "@/components/landing/steps";
import { CtaSection } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StepsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
