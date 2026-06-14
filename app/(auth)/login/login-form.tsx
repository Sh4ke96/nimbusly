"use client";

import { AUTH_FORM_FIELD } from "@/lib/auth/form";
import { useActionState } from "react";
import { login, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/lang-context";

export function LoginForm() {
  const t = useT();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t.login.emailLabel}</Label>
        <Input
          id="email"
          name={AUTH_FORM_FIELD.EMAIL}
          type="email"
          required
          autoComplete="email"
          placeholder={t.login.emailPlaceholder}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t.login.passwordLabel}</Label>
        <Input
          id="password"
          name={AUTH_FORM_FIELD.PASSWORD}
          type="password"
          required
          autoComplete="current-password"
          placeholder={t.login.passwordPlaceholder}
        />
      </div>

      {"error" in (state ?? {}) && (
        <p className="text-sm text-destructive rounded-none bg-destructive/10 px-3 py-2">
          {(state as { error: string }).error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t.login.submitting : t.login.submitBtn}
      </Button>
    </form>
  );
}
