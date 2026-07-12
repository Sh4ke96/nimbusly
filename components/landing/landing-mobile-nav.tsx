"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { DEMO_SECTION_ID } from "@/lib/constants/demo-mode";
import { scrollToLandingSection } from "@/lib/landing/scroll-to-section";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { Play, Sparkles, Zap, Cloud, Heart } from "lucide-react";

const MOBILE_LINKS = [
  { key: "demo", icon: Play, slug: () => DEMO_SECTION_ID },
  { key: "features", icon: Sparkles, slug: (t: ReturnType<typeof useT>) => t.nav.featuresSlug },
  { key: "howItWorks", icon: Zap, slug: (t: ReturnType<typeof useT>) => t.nav.howItWorksSlug },
  { key: "nimbus", icon: Cloud, slug: (t: ReturnType<typeof useT>) => t.nav.nimbusSlug },
  { key: "forFamily", icon: Heart, slug: (t: ReturnType<typeof useT>) => t.nav.forFamilySlug },
] as const;

export function LandingMobileNav() {
  const t = useT();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    if (pathname !== "/") return;
    event.preventDefault();
    scrollToLandingSection(sectionId);
    window.history.replaceState(null, "", `/#${sectionId}`);
  }

  const labels: Record<(typeof MOBILE_LINKS)[number]["key"], string> = {
    demo: t.nav.demo,
    features: t.nav.features,
    howItWorks: t.nav.howItWorks,
    nimbus: t.nav.nimbus,
    forFamily: t.nav.forFamily,
  };

  return (
    <nav
      aria-label={t.nav.mobileSectionsAria}
      className="border-b border-border/50 bg-background/90 px-2 py-2 md:hidden"
    >
      <ul className="flex gap-1 overflow-x-auto scroll-px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MOBILE_LINKS.map(({ key, icon: Icon, slug }) => {
          const sectionId = typeof slug === "function" ? slug(t) : slug;
          return (
            <li key={key} className="shrink-0">
              <Link
                href={pathname === "/" ? `#${sectionId}` : `/#${sectionId}`}
                onClick={(event) => handleClick(event, sectionId)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-none border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5 text-primary" aria-hidden />
                {labels[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
