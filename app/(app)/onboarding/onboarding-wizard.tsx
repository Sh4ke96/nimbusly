"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/member-avatar";
import { AVATAR_COLORS, DEFAULT_AVATAR_COLOR, type AvatarColor } from "@/lib/avatar-colors";
import { INVITE_TOKEN_COOKIE } from "@/lib/family/constants";
import { formatInviteCode, readInviteCodeFromCookie } from "@/lib/family/invite";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import type { FamilySetupIntent } from "@/lib/profile";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { completeOnboarding, type OnboardingState } from "./actions";
import { Check, ChevronLeft, ChevronRight, Heart, Ticket, User } from "lucide-react";

const STEPS = ["color", "name", "account"] as const;
type Step = (typeof STEPS)[number];

function readInviteTokenCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${INVITE_TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
}

export function OnboardingWizard() {
  const t = useT();
  const [step, setStep] = useState<Step>("color");
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(DEFAULT_AVATAR_COLOR);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [familyIntent, setFamilyIntent] = useState<FamilySetupIntent>(() => {
    if (readInviteTokenCookie() || readInviteCodeFromCookie()) return "join";
    return "create";
  });
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState(() => readInviteCodeFromCookie());
  const [inviteToken] = useState(() => readInviteTokenCookie());
  const inviteCodeFromRegistration = inviteCode.length > 0 && !inviteToken;
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    null
  );

  useActionFeedback(state);

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
    if (step === "account" && familyIntent === "create") return familyName.trim().length > 0;
    if (step === "account" && familyIntent === "join") {
      return inviteToken.length > 0 || inviteCode.trim().length > 0;
    }
    return true;
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="avatarColor" value={avatarColor} />
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      <input type="hidden" name="familyIntent" value={familyIntent} />
      <input type="hidden" name="familyName" value={familyName} />
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <input type="hidden" name="inviteToken" value={inviteToken} />

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

          <div className="mx-auto grid w-fit grid-cols-7 gap-3">
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
              variant={familyIntent === "create" ? "default" : "outline"}
              className="h-auto w-full justify-start rounded-none p-4 text-left"
              onClick={() => setFamilyIntent("create")}
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
              variant={familyIntent === "join" ? "default" : "outline"}
              className="h-auto w-full justify-start rounded-none p-4 text-left"
              onClick={() => setFamilyIntent("join")}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-none bg-primary/10 text-primary">
                  <Ticket className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-heading font-semibold">{t.onboarding.joinFamilyTitle}</p>
                  <p className="text-sm font-normal opacity-80">{t.onboarding.joinFamilyDesc}</p>
                </div>
              </div>
            </Button>

            <Button
              type="button"
              variant={familyIntent === "solo" ? "default" : "outline"}
              className="h-auto w-full justify-start rounded-none p-4 text-left"
              onClick={() => setFamilyIntent("solo")}
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

          {familyIntent === "create" && (
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

          {familyIntent === "join" && inviteToken && (
            <p className="text-sm text-muted-foreground rounded-none border border-primary/30 bg-primary/10 px-3 py-2">
              {t.onboarding.inviteEmailPending}
            </p>
          )}

          {familyIntent === "join" && inviteCodeFromRegistration && (
            <p className="text-sm text-muted-foreground rounded-none border border-primary/30 bg-primary/10 px-3 py-2">
              {t.onboarding.inviteCodeFromRegistration}
            </p>
          )}

          {familyIntent === "join" && !inviteToken && (
            <div className="space-y-1.5 animate-rise">
              <Label htmlFor="inviteCode">{t.onboarding.inviteCodeLabel}</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(formatInviteCode(e.target.value))}
                placeholder={t.onboarding.inviteCodePlaceholder}
                className="font-mono uppercase tracking-widest"
                maxLength={9}
              />
            </div>
          )}
        </div>
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
