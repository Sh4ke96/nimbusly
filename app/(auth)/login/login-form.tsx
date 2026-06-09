"use client";

import { useActionState } from "react";
import { login, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/lang-context";

const inputClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 transition-colors";

export function LoginForm() {
  const t = useT();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t.login.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.login.emailPlaceholder}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          {t.login.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder={t.login.passwordPlaceholder}
          className={inputClass}
        />
      </div>

      {"error" in (state ?? {}) && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
          {(state as { error: string }).error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t.login.submitting : t.login.submitBtn}
      </Button>
    </form>
  );
}
