"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";
import { logout } from "@/app/(app)/actions";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.dashboard.logoutConfirmTitle}</DialogTitle>
          <DialogDescription>{t.dashboard.logoutConfirmDesc}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-none"
            onClick={() => onOpenChange(false)}
          >
            {t.account.accountTypeConfirmDialogCancel}
          </Button>
          <form
            action={logout}
            onSubmit={() => {
              onOpenChange(false);
            }}
          >
            <Button
              type="submit"
              variant="destructive"
              className="cursor-pointer rounded-none"
              data-testid="logout-confirm-submit"
            >
              {t.dashboard.logout}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
