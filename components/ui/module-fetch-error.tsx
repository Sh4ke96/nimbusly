"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";

interface ModuleFetchErrorProps {
  onRetry: () => void;
}

export function ModuleFetchError({ onRetry }: ModuleFetchErrorProps) {
  const t = useT();

  return (
    <div className="flex flex-col items-center gap-3 border border-destructive/30 bg-destructive/5 px-4 py-8 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <p className="text-sm text-muted-foreground max-w-md">{t.module.fetchError}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {t.module.retry}
      </Button>
    </div>
  );
}
