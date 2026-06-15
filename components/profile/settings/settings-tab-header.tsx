import type { LucideIcon } from "lucide-react";

interface SettingsTabHeaderProps {
  icon: LucideIcon;
  title: string;
}

export function SettingsTabHeader({ icon: Icon, title }: SettingsTabHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}
