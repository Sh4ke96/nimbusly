import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SettingsFormFooterProps {
  pending: boolean;
  savingLabel: string;
  saveLabel: string;
  saveDisabled?: boolean;
}

export function SettingsFormFooter({
  pending,
  savingLabel,
  saveLabel,
  saveDisabled = false,
}: SettingsFormFooterProps) {
  return (
    <div className="space-y-4 pt-2">
      <Separator />
      <Button type="submit" disabled={pending || saveDisabled}>
        {pending ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
