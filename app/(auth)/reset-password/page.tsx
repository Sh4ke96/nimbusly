"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.account.resetPasswordLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.account.resetPasswordMismatch);
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t.account.errorGeneric);
      setPending(false);
      return;
    }

    setSuccess(true);
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

      {success ? (
        <p className="text-sm text-primary rounded-none bg-primary/10 px-3 py-2 text-center">
          {t.account.resetPasswordSuccess}
        </p>
      ) : (
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

          {error && (
            <p className="text-sm text-destructive rounded-none bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? t.account.resetPasswordSubmitting : t.account.resetPasswordBtn}
          </Button>
        </form>
      )}
    </div>
  );
}
