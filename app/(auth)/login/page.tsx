"use client";

import Link from "next/link";
import { LoginForm } from "./login-form";
import { useT } from "@/lib/lang-context";

export default function LoginPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading font-bold text-2xl tracking-tight">
          {t.login.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.login.subtitle}</p>
      </div>

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
