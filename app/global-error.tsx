"use client";

import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LANG, type Lang } from "@/lib/constants/lang";
import { dict } from "@/lib/i18n";

function resolveGlobalErrorLang(): Lang {
  if (typeof document === "undefined") return LANG.PL;
  return document.documentElement.lang === LANG.EN ? LANG.EN : LANG.PL;
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang] = useState<Lang>(resolveGlobalErrorLang);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  const t = dict[lang].errors;

  function handleReload() {
    // global-error replaces the root layout — soft navigations do not clear it.
    window.location.assign("/dashboard");
  }

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background text-foreground">
        <Logo size="sm" asLink={false} className="mb-8" />
        <h1 className="font-heading font-bold text-2xl tracking-tight">{t.globalTitle}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.globalDesc}</p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {t.globalDigest}: {error.digest}
          </p>
        ) : null}
        <Button type="button" className="mt-6 rounded-none min-h-11" onClick={handleReload}>
          {t.globalReload}
        </Button>
      </body>
    </html>
  );
}
