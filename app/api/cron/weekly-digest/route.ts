import { NextResponse } from "next/server";
import { dict } from "@/lib/i18n";
import { LANG, type Lang } from "@/lib/constants/lang";
import {
  groupNotificationsForDigest,
  hasDigestContent,
} from "@/lib/notifications/daily-digest/build-daily-digest";
import { buildDailyDigestHtml } from "@/lib/notifications/daily-digest/format-daily-digest-email";
import { sendReminderEmail } from "@/lib/notifications/send-email";
import { DEV_SITE_URL } from "@/lib/constants/dev";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { loadAllModulePreferencesForUser } from "@/lib/notifications/module-preferences/load-module-preferences";
import type { AppNotification } from "@/lib/notifications/types";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ sent: 0, skipped: true, reason: "RESEND_API_KEY missing" });
  }

  const supabase = createServiceRoleClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEV_SITE_URL;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, family_id, first_name, last_name, preferred_lang, weekly_digest_enabled")
    .eq("weekly_digest_enabled", true);

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles ?? []) {
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    const email = authUser.user?.email;
    if (!email) continue;

    const preferences = await loadAllModulePreferencesForUser(supabase, profile.id);
    const hasEmailModule = preferences.some((pref) => pref.emailDigestEnabled);
    if (!hasEmailModule) continue;

    const lang: Lang =
      profile.preferred_lang === LANG.EN ? LANG.EN : LANG.PL;
    const moduleLabels = dict[lang].dashboard.moduleLabels as Record<
      NotificationModuleId,
      string
    >;

    const { data: recentNotifications } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, payload, read_at, created_at")
      .eq("user_id", profile.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100);

    const activitySections = groupNotificationsForDigest(
      (recentNotifications ?? []) as AppNotification[],
      preferences
    ).map((section) => ({
      ...section,
      title: moduleLabels[section.moduleId] ?? section.moduleId,
    }));

    const sections = activitySections.filter((section) => section.lines.length > 0);
    if (!hasDigestContent(sections)) continue;

    const itemCount = sections.reduce((sum, section) => sum + section.lines.length, 0);

    try {
      const html = buildDailyDigestHtml({
        attentionLines: [],
        activitySections: sections,
        moduleLabels,
        lang,
        siteUrl,
      });
      const subject =
        lang === LANG.PL
          ? `Nimbusly — tygodniowe podsumowanie (${itemCount})`
          : `Nimbusly — weekly summary (${itemCount})`;
      const result = await sendReminderEmail({ to: email, subject, html });
      if (result.sent) sent += 1;
    } catch (error) {
      errors.push(`${profile.id}: ${error instanceof Error ? error.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors });
}
