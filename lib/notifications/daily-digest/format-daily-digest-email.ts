import type { Lang } from "@/lib/constants/lang";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";
import { dict } from "@/lib/i18n";
import type { DailyDigestSection } from "@/lib/notifications/daily-digest/build-daily-digest";

export function buildDailyDigestHtml(params: {
  attentionLines: string[];
  activitySections: DailyDigestSection[];
  moduleLabels: Record<NotificationModuleId, string>;
  lang: Lang;
  siteUrl: string;
  heading?: string;
  intro?: string;
  activityHeading?: string;
}): string {
  const t = dict[params.lang].notifications;
  const heading = params.heading ?? t.digestEmailHeading;
  const intro = params.intro ?? t.digestEmailIntro;
  const activityHeading = params.activityHeading ?? t.digestActivityHeading;
  const attentionList = params.attentionLines
    .map((line) => `<li style="margin:8px 0">${line}</li>`)
    .join("");

  const activityBlocks = params.activitySections
    .map((section) => {
      const label = params.moduleLabels[section.moduleId] ?? section.moduleId;
      const items = section.lines
        .map((line) => `<li style="margin:6px 0">${line}</li>`)
        .join("");
      return `<h2 style="font-size:16px;margin:20px 0 8px">${label}</h2><ul style="padding-left:20px;line-height:1.5">${items}</ul>`;
    })
    .join("");

  const attentionBlock =
    params.attentionLines.length > 0
      ? `<h2 style="font-size:16px;margin:16px 0 8px">${t.digestAttentionHeading}</h2><ul style="padding-left:20px;line-height:1.5">${attentionList}</ul>`
      : "";

  return `<!DOCTYPE html>
<html lang="${params.lang}">
<body style="font-family:system-ui,sans-serif;background:#f6f4f0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e0d8;padding:32px">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#618764;font-weight:700">Nimbusly</p>
    <h1 style="font-size:22px;margin:16px 0 8px">${heading}</h1>
    <p style="color:#4a4a4a;line-height:1.5">${intro}</p>
    ${attentionBlock}
    ${params.activitySections.length > 0 ? `<h2 style="font-size:16px;margin:20px 0 8px">${activityHeading}</h2>${activityBlocks}` : ""}
    <p style="margin:24px 0">
      <a href="${params.siteUrl}/dashboard" style="display:inline-block;background:#618764;color:#fff;padding:12px 20px;text-decoration:none;font-weight:600">${t.reminderEmailCta}</a>
    </p>
    <p style="font-size:12px;color:#888">${t.digestEmailFooter}</p>
  </div>
</body>
</html>`;
}

export function buildDailyDigestSubject(lang: Lang, itemCount: number): string {
  const t = dict[lang].notifications;
  return t.digestEmailSubject.replace("{count}", String(itemCount));
}
