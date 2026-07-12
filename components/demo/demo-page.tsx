"use client";

import { SiteNavbar } from "@/components/landing/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { DemoPageContent } from "@/components/demo/demo-panels";
import { AmbientBackground } from "@/components/ui/ambient-background";

export function DemoPage() {
  return (
    <div className="relative min-h-screen flex flex-col text-foreground">
      <AmbientBackground variant="landing" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNavbar />
        <main className="flex-1">
          <DemoPageContent />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
