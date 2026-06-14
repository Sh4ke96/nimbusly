import type { AttentionItem } from "@/lib/dashboard/attention";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { formatMessage } from "@/lib/i18n/format";

export function formatAttentionItemsAsLines(items: AttentionItem[]): string[] {
  return items.map((item) => item.label);
}

export function buildReminderDigestHtml(params: {
  lines: string[];
  lang: Lang;
  siteUrl: string;
}): string {
  const t = dict[params.lang].notifications;
  const list = params.lines.map((line) => `<li style="margin:8px 0">${line}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="${params.lang}">
<body style="font-family:system-ui,sans-serif;background:#f6f4f0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e0d8;padding:32px">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#618764;font-weight:700">Nimbusly</p>
    <h1 style="font-size:22px;margin:16px 0 8px">${t.reminderEmailHeading}</h1>
    <p style="color:#4a4a4a;line-height:1.5">${t.reminderEmailIntro}</p>
    <ul style="color:#273338;padding-left:20px;line-height:1.5">${list}</ul>
    <p style="margin:24px 0">
      <a href="${params.siteUrl}/dashboard" style="display:inline-block;background:#618764;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">${t.reminderEmailCta}</a>
    </p>
    <p style="font-size:12px;color:#888">${t.reminderEmailFooter}</p>
  </div>
</body>
</html>`;
}

export function buildReminderEmailSubject(lang: Lang, count: number): string {
  return formatMessage(dict[lang].notifications.reminderEmailSubject, {
    count: String(count),
  });
}
