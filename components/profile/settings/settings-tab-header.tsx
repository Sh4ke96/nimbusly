import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsTabHeaderProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

export function SettingsTabHeader({
  icon: Icon,
  title,
  className,
}: SettingsTabHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex items-center gap-3 border-b border-border pb-6",
        className
      )}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}
