"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useT } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Zap, Heart, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function SiteNavbar() {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 flex h-16 items-center justify-between gap-4">
        <Logo size="sm" />

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href={`#${t.nav.featuresSlug}`}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
          >
            <Sparkles className="size-3.5 text-primary" />
            {t.nav.features}
          </Link>
          <Link
            href={`#${t.nav.howItWorksSlug}`}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
          >
            <Zap className="size-3.5 text-primary" />
            {t.nav.howItWorks}
          </Link>
          <Link
            href={`#${t.nav.forFamilySlug}`}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
          >
            <Heart className="size-3.5 text-primary" />
            {t.nav.forFamily}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle className="hidden sm:flex" />

          {user ? (
            <Button size="sm" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                {t.nav.dashboard}
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/register">{t.nav.getStarted}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
