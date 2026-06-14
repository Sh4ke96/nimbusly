"use client";

import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { useT } from "@/lib/lang-context";

export default function ChangePasswordPage() {
  const t = useT();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-md px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.account.changePasswordTitle} />

        <div className="space-y-1">
          <h1 className="font-heading font-bold text-2xl tracking-tight">
            {t.account.changePasswordTitle}
          </h1>
        </div>

        <Card className="rounded-none shadow-sm">
          <CardContent className="pt-8">
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
