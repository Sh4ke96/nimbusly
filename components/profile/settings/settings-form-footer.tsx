import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SettingsFormFooterProps {
  pending: boolean;
  savingLabel: string;
  saveLabel: string;
}

export function SettingsFormFooter({
  pending,
  savingLabel,
  saveLabel,
}: SettingsFormFooterProps) {
  return (
    <div className="space-y-4 pt-2">
      <Separator />
      <Button type="submit" disabled={pending}>
        {pending ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
