import { buildFamilyInviteRegisterUrl } from "@/lib/family/invite";

type SendFamilyInviteEmailParams = {
  to: string;
  familyName: string;
  inviteToken: string;
  inviterName: string;
  lang: "pl" | "en";
};

const copy = {
  pl: {
    subject: (family: string) => `Zaproszenie do rodziny „${family}” — Nimbusly`,
    heading: "Dołącz do rodziny w Nimbusly",
    body: (inviter: string, family: string) =>
      `${inviter} zaprasza Cię do rodziny „${family}” w Nimbusly.`,
    cta: "Załóż konto i dołącz",
    footer: "Link jest ważny 14 dni. Jeśli to nie Ty prosiłeś o zaproszenie, zignoruj tę wiadomość.",
  },
  en: {
    subject: (family: string) => `Invitation to join “${family}” — Nimbusly`,
    heading: "Join your family on Nimbusly",
    body: (inviter: string, family: string) =>
      `${inviter} invited you to join the “${family}” family on Nimbusly.`,
    cta: "Create account and join",
    footer: "This link is valid for 14 days. If you did not expect this email, you can ignore it.",
  },
} as const;

export async function sendFamilyInviteEmail({
  to,
  familyName,
  inviteToken,
  inviterName,
  lang,
}: SendFamilyInviteEmailParams): Promise<{ sent: boolean; inviteUrl: string }> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inviteUrl = buildFamilyInviteRegisterUrl(origin, inviteToken);
  const t = copy[lang];
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Nimbusly <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, inviteUrl };
  }

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<body style="font-family:system-ui,sans-serif;background:#f6f4f0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e0d8;padding:32px">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#618764;font-weight:700">Nimbusly</p>
    <h1 style="font-size:22px;margin:16px 0 8px">${t.heading}</h1>
    <p style="color:#4a4a4a;line-height:1.5">${t.body(inviterName, familyName)}</p>
    <p style="margin:24px 0">
      <a href="${inviteUrl}" style="display:inline-block;background:#618764;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">${t.cta}</a>
    </p>
    <p style="font-size:12px;color:#888">${t.footer}</p>
  </div>
</body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: t.subject(familyName),
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status}`);
  }

  return { sent: true, inviteUrl };
}
