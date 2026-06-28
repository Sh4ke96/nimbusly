"use client";

import { useEffect, useState } from "react";
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
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang] = useState<Lang>(resolveGlobalErrorLang);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const t = dict[lang].errors;

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background text-foreground">
        <Logo size="sm" href="/dashboard" className="mb-8" />
        <h1 className="font-heading font-bold text-2xl tracking-tight">{t.globalTitle}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.globalDesc}</p>
        <Button type="button" className="mt-6 rounded-none min-h-11" onClick={() => reset()}>
          {t.globalRetry}
        </Button>
      </body>
    </html>
  );
}
