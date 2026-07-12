import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModuleEmptyStateProps {
  icon?: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ModuleEmptyState({
  icon: Icon,
  message,
  actionLabel,
  onAction,
  className,
}: ModuleEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 border border-dashed border-border bg-muted/20 px-4 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="inline-flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      ) : null}
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
