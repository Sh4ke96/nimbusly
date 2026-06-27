import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { OfflineRetryButton } from "@/components/pwa/offline-retry-button";
import { getServerT } from "@/lib/i18n/server";

export default async function OfflinePage() {
  const t = await getServerT();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <Logo size="sm" href="/dashboard" className="mb-8" />
      <WifiOff className="size-12 text-muted-foreground mb-4" aria-hidden />
      <h1 className="font-heading font-bold text-2xl tracking-tight">{t.pwa.offlineTitle}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.pwa.offlineDesc}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="rounded-none min-h-11">
          <Link href="/dashboard">{t.pwa.offlineHome}</Link>
        </Button>
        <OfflineRetryButton />
      </div>
    </div>
  );
}
