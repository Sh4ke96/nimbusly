"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { useT } from "@/lib/lang-context";

export function LoginPageContent() {
  const t = useT();
  const searchParams = useSearchParams();
  const passwordChanged = searchParams.get("password_changed") === "1";

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading font-bold text-2xl tracking-tight">
          {t.login.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.login.subtitle}</p>
      </div>

      {passwordChanged && (
        <Card className="border-primary/30 bg-primary/10 shadow-none">
          <CardContent className="py-6 text-center space-y-1">
            <CheckCircle2 className="size-6 text-primary mx-auto" />
            <p className="text-sm font-medium text-foreground">
              {t.login.passwordChangedTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.login.passwordChangedMessage}
            </p>
          </CardContent>
        </Card>
      )}

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        {t.login.noAccount}{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-medium"
        >
          {t.login.signUp}
        </Link>
      </p>
    </div>
  );
}
