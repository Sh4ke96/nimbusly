"use client";

import { Button } from "@/components/ui/button";

type OfflinePageActionsProps = {
  homeHref: string;
  homeLabel: string;
  retryLabel: string;
};

export function OfflinePageActions({ homeHref, homeLabel, retryLabel }: OfflinePageActionsProps) {
  return (
    <div className="mt-6 flex w-full max-w-xs flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
      <Button asChild className="rounded-none min-h-11 w-full sm:w-auto">
        <a href={homeHref}>{homeLabel}</a>
      </Button>
      <Button
        type="button"
        variant="outline"
        className="rounded-none min-h-11 w-full sm:w-auto"
        onClick={() => window.location.reload()}
      >
        {retryLabel}
      </Button>
    </div>
  );
}
