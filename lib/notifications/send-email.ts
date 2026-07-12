import type { Lang } from "@/lib/i18n";

type SendReminderEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendReminderEmail({
  to,
  subject,
  html,
}: SendReminderEmailParams): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Nimbusly <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false };
  }

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

  return { sent: true };
}

/** @deprecated Use sendReminderEmail - kept for compatibility */
export async function sendBirthdayNotificationEmail(): Promise<{ sent: false }> {
  return { sent: false };
}

export type { Lang };
