"use client";

import { useActionState } from "react";
import { register, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/lang-context";

const inputClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 transition-colors";

export function RegisterForm() {
  const t = useT();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    register,
    null
  );

  if (state && "success" in state) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center space-y-1">
        <CheckCircle2 className="size-6 text-primary mx-auto" />
        <p className="text-sm font-medium text-foreground">
          {t.register.successTitle}
        </p>
        <p className="text-xs text-muted-foreground">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t.register.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.register.emailPlaceholder}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          {t.register.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder={t.register.passwordPlaceholder}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          {t.register.confirmLabel}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder={t.register.confirmPlaceholder}
          className={inputClass}
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t.register.submitting : t.register.submitBtn}
      </Button>
    </form>
  );
}
