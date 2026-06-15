"use client";

import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface NimbusTourToolbarAnchorProps {
  tourTarget: string;
  visible: boolean;
  children: React.ReactNode;
  placeholderLabel?: string;
  className?: string;
}

export function NimbusTourToolbarAnchor({
  tourTarget,
  visible,
  children,
  placeholderLabel,
  className,
}: NimbusTourToolbarAnchorProps) {
  const t = useT();

  return (
    <div data-nimbus-tour={tourTarget} className={cn("inline-flex", className)}>
      {visible ? (
        children
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none cursor-default rounded-none h-8 gap-1.5 opacity-80"
        >
          <ListFilter className="size-3.5" />
          {placeholderLabel ?? t.common.filters}
        </Button>
      )}
    </div>
  );
}
