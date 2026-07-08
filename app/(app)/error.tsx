"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AppViewShell } from "@/components/app/app-view-shell";
import { useT } from "@/lib/lang-context";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <AppViewShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
        <Logo size="sm" href="/dashboard" className="mb-8" />
        <h1 className="font-heading font-bold text-2xl tracking-tight">{t.errors.globalTitle}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.errors.globalDesc}</p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {t.errors.globalDigest}: {error.digest}
          </p>
        ) : null}
        <Button type="button" className="mt-6 min-h-11 rounded-none" onClick={() => reset()}>
          {t.errors.globalRetry}
        </Button>
      </div>
    </AppViewShell>
  );
}
