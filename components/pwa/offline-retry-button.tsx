"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";

export function OfflineRetryButton() {
  const t = useT();

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-none min-h-11"
      onClick={() => window.location.reload()}
    >
      {t.pwa.offlineRetry}
    </Button>
  );
}
