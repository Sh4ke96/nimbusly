"use client";

import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";
import { RegisterInviteCapture } from "./register-invite-capture";
import { useT } from "@/lib/lang-context";

export default function RegisterPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <RegisterInviteCapture />
      </Suspense>
      <div className="space-y-1 text-center">
        <h1 className="font-heading font-bold text-2xl tracking-tight">
          {t.register.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.register.subtitle}</p>
      </div>

      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        {t.register.hasAccount}{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          {t.register.signIn}
        </Link>
      </p>
    </div>
  );
}
