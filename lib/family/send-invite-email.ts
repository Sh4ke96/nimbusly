import { buildFamilyInviteRegisterUrl } from "@/lib/family/invite";
import { dict } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { formatMessage } from "@/lib/i18n/format";

type SendFamilyInviteEmailParams = {
  to: string;
  familyName: string;
  inviteToken: string;
  inviterName: string;
  lang: Lang;
};

export async function sendFamilyInviteEmail({
  to,
  familyName,
  inviteToken,
  inviterName,
  lang,
}: SendFamilyInviteEmailParams): Promise<{ sent: boolean; inviteUrl: string }> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inviteUrl = buildFamilyInviteRegisterUrl(origin, inviteToken);
  const t = dict[lang].account;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Nimbusly <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, inviteUrl };
  }

  const subject = formatMessage(t.familyInviteEmailSubject, { family: familyName });
  const body = formatMessage(t.familyInviteEmailBody, {
    inviter: inviterName,
    family: familyName,
  });

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<body style="font-family:system-ui,sans-serif;background:#f6f4f0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e5e0d8;padding:32px">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#618764;font-weight:700">Nimbusly</p>
    <h1 style="font-size:22px;margin:16px 0 8px">${t.familyInviteEmailHeading}</h1>
    <p style="color:#4a4a4a;line-height:1.5">${body}</p>
    <p style="margin:24px 0">
      <a href="${inviteUrl}" style="display:inline-block;background:#618764;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">${t.familyInviteEmailCta}</a>
    </p>
    <p style="font-size:12px;color:#888">${t.familyInviteEmailFooter}</p>
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
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status}`);
  }

  return { sent: true, inviteUrl };
}
