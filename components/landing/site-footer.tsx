"use client";

import { Heart } from "lucide-react";
import { Logo } from "@/components/logo";
import { useT } from "@/lib/lang-context";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <Logo size="sm" />
        <p>© 2026 Nimbusly. {t.footer.rights}</p>
        <a
          href="/change-log"
          className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          {t.footer.changeLog}
        </a>
        <p className="flex items-center gap-1.5">
          {t.footer.madeWith}
          <Heart className="size-3.5 fill-primary text-primary" />
        </p>
      </div>
    </footer>
  );
}
