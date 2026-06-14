"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import { AVATAR_COLORS, DEFAULT_AVATAR_COLOR, type AvatarColor } from "@/lib/avatar-colors";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { completeOnboarding, type OnboardingState } from "./actions";
import { Check, ChevronLeft, ChevronRight, Heart, User } from "lucide-react";
import type { AccountMode } from "@/lib/profile";

const STEPS = ["color", "name", "account"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingWizard() {
  const t = useT();
  const [step, setStep] = useState<Step>("color");
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(DEFAULT_AVATAR_COLOR);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountMode, setAccountMode] = useState<AccountMode>("family");
  const [familyName, setFamilyName] = useState("");
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    null
  );

  const stepIndex = STEPS.indexOf(step);
  const previewName =
    `${firstName} ${lastName}`.trim() || t.onboarding.firstNamePlaceholder;

  const stepLabels = [t.onboarding.stepColor, t.onboarding.stepName, t.onboarding.stepAccount];

  function goNext() {
    if (step === "color") setStep("name");
    else if (step === "name") setStep("account");
  }

  function goBack() {
    if (step === "account") setStep("name");
    else if (step === "name") setStep("color");
  }

  function canContinue() {
    if (step === "name") return firstName.trim().length > 0 && lastName.trim().length > 0;
    if (step === "account" && accountMode === "family") return familyName.trim().length > 0;
    return true;
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="avatarColor" value={avatarColor} />
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      <input type="hidden" name="accountMode" value={accountMode} />
      <input type="hidden" name="familyName" value={familyName} />

      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-none text-xs font-semibold transition-colors",
                i < stepIndex && "bg-primary text-primary-foreground",
                i === stepIndex && "bg-primary/15 text-primary ring-2 ring-primary/40",
                i > stepIndex && "bg-muted text-muted-foreground"
              )}
            >
              {i < stepIndex ? <Check className="size-4" /> : i + 1}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "hidden sm:block h-px w-10",
                  i < stepIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {stepLabels[stepIndex]}
      </p>

      {step === "color" && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="font-heading font-bold text-2xl tracking-tight">
              {t.onboarding.colorTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{t.onboarding.colorDesc}</p>
          </div>

          <MemberAvatar name={previewName} color={avatarColor} size="lg" className="mx-auto" />

          <div className="flex flex-wrap items-center justify-center gap-3">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setAvatarColor(color.value)}
                className={cn(
                  "size-11 rounded-none transition-all hover:scale-110",
                  avatarColor === color.value &&
                    "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                )}
                style={{ backgroundColor: color.value }}
                aria-label={color.id}
              />
            ))}
          </div>
        </div>
      )}

      {step === "name" && (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="font-heading font-bold text-2xl tracking-tight">
              {t.onboarding.nameTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{t.onboarding.nameDesc}</p>
          </div>

          <div className="flex justify-center">
            <MemberAvatar name={previewName} color={avatarColor} size="lg" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t.onboarding.firstNameLabel}</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.onboarding.firstNamePlaceholder}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t.onboarding.lastNameLabel}</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.onboarding.lastNamePlaceholder}
                autoComplete="family-name"
              />
            </div>
          </div>
        </div>
      )}

      {step === "account" && (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="font-heading font-bold text-2xl tracking-tight">
              {t.onboarding.accountTitle}
            </h2>
            <p className="text-sm text-muted-foreground">{t.onboarding.accountDesc}</p>
          </div>

          <div className="grid gap-3">
            <Button
              type="button"
              variant={accountMode === "family" ? "default" : "outline"}
              className="h-auto w-full justify-start rounded-none p-4 text-left"
              onClick={() => setAccountMode("family")}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
                  <Heart className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-heading font-semibold">{t.onboarding.familyTitle}</p>
                  <p className="text-sm font-normal opacity-80">{t.onboarding.familyDesc}</p>
                </div>
              </div>
            </Button>

            <Button
              type="button"
              variant={accountMode === "solo" ? "default" : "outline"}
              className="h-auto w-full justify-start rounded-none p-4 text-left"
              onClick={() => setAccountMode("solo")}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
                  <User className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-heading font-semibold">{t.onboarding.soloTitle}</p>
                  <p className="text-sm font-normal opacity-80">{t.onboarding.soloDesc}</p>
                </div>
              </div>
            </Button>
          </div>

          {accountMode === "family" && (
            <div className="space-y-1.5 animate-rise">
              <Label htmlFor="familyName">{t.onboarding.familyNameLabel}</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder={t.onboarding.familyNamePlaceholder}
              />
            </div>
          )}
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-destructive rounded-none bg-destructive/10 px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {step !== "color" ? (
          <Button type="button" variant="outline" onClick={goBack} disabled={pending}>
            <ChevronLeft className="size-4" />
            {t.onboarding.back}
          </Button>
        ) : (
          <span />
        )}

        {step !== "account" ? (
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            {t.onboarding.next}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={pending || !canContinue()}>
            {pending ? t.onboarding.submitting : t.onboarding.finish}
          </Button>
        )}
      </div>
    </form>
  );
}
