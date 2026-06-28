"use client";

import { AUTH_FORM_FIELD } from "@/lib/auth/form";
import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { register, type AuthState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/lang-context";
import {
  formatInviteCode,
  isValidInviteCodeFormat,
  readInviteCodeFromCookie,
} from "@/lib/family/invite";

function readInitialInviteCode(codeFromUrl: string | null): string {
  if (codeFromUrl && isValidInviteCodeFormat(codeFromUrl)) {
    return formatInviteCode(codeFromUrl);
  }
  return readInviteCodeFromCookie();
}

export function RegisterForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState<string>(() =>
    readInitialInviteCode(searchParams.get("code"))
  );
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
          name={AUTH_FORM_FIELD.EMAIL}
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
          name={AUTH_FORM_FIELD.PASSWORD}
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
          name={AUTH_FORM_FIELD.CONFIRM_PASSWORD}
          type="password"
          required
          autoComplete="new-password"
          placeholder={t.register.confirmPlaceholder}
        />
      </div>

      <div className="space-y-1.5 rounded-none border border-border bg-muted/30 p-4">
        <Label htmlFor="inviteCode">{t.register.inviteCodeLabel}</Label>
        <Input
          id="inviteCode"
          name={AUTH_FORM_FIELD.INVITE_CODE}
          value={inviteCode}
          onChange={(e) => setInviteCode(formatInviteCode(e.target.value))}
          placeholder={t.register.inviteCodePlaceholder}
          className="font-mono uppercase tracking-widest bg-background"
          maxLength={9}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">{t.register.inviteCodeDesc}</p>
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
