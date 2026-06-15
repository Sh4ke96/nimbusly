import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleSectionHeadingProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function ModuleSectionHeading({
  icon: Icon,
  children,
  className,
}: ModuleSectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary"
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
        {children}
      </h2>
    </div>
  );
}
