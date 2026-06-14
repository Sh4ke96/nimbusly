"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error(t.account.resetPasswordLength);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.account.resetPasswordMismatch);
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      toast.error(t.account.errorGeneric);
      setPending(false);
      return;
    }

    toast.success(t.account.resetPasswordSuccess);
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login?password_changed=1"), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading font-bold text-2xl tracking-tight">
          {t.account.resetPasswordTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{t.account.resetPasswordDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t.account.newPasswordLabel}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t.account.confirmPasswordLabel}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? t.account.resetPasswordSubmitting : t.account.resetPasswordBtn}
        </Button>
      </form>
    </div>
  );
}
