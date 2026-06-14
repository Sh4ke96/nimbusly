"use client";

import { useActionState } from "react";
import { register, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/lang-context";

export function RegisterForm() {
  const t = useT();
  const [state, action, pending] = useActionState<AuthState, FormData>(
    register,
    null
  );

  if (state && "success" in state) {
    return (
      <Card className="border-primary/30 bg-primary/10 shadow-none">
        <CardContent className="pt-6 text-center space-y-1">
          <CheckCircle2 className="size-6 text-primary mx-auto" />
          <p className="text-sm font-medium text-foreground">
            {t.register.successTitle}
          </p>
          <p className="text-xs text-muted-foreground">{state.success}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">{t.register.emailLabel}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.register.emailPlaceholder}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t.register.passwordLabel}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder={t.register.passwordPlaceholder}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t.register.confirmLabel}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder={t.register.confirmPlaceholder}
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive rounded-none bg-destructive/10 px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t.register.submitting : t.register.submitBtn}
      </Button>
    </form>
  );
}
