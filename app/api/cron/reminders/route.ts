import { NextResponse } from "next/server";
import { buildAttentionItems } from "@/lib/dashboard/attention";
import { dict } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { formatMessage } from "@/lib/i18n/format";
import {
  buildReminderDigestHtml,
  buildReminderEmailSubject,
  formatAttentionItemsAsLines,
} from "@/lib/notifications/reminder-digest";
import { sendReminderEmail } from "@/lib/notifications/send-email";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function scopeFilter(familyId: string | null, userId: string) {
  return familyId
    ? { column: "family_id" as const, value: familyId }
    : { column: "created_by" as const, value: userId };
}

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, family_id, first_name, last_name");

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles ?? []) {
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    const email = authUser.user?.email;
    if (!email) continue;

    const scope = scopeFilter(profile.family_id, profile.id);
    const lang: Lang = "pl";
    const t = dict[lang].dashboard;

    const [{ data: choreTasks }, { data: medicineItems }, { data: careItems }, { data: pets }, { data: birthdays }] =
      await Promise.all([
        supabase.from("chore_tasks").select("*").eq(scope.column, scope.value),
        supabase.from("medicine_items").select("*").eq(scope.column, scope.value),
        supabase.from("pet_care_items").select("*").eq(scope.column, scope.value),
        supabase.from("pets").select("*").eq(scope.column, scope.value),
        supabase.from("birthday_entries").select("*").eq(scope.column, scope.value),
      ]);

    const items = buildAttentionItems({
      choreTasks: choreTasks ?? [],
      medicineItems: medicineItems ?? [],
      careItems: careItems ?? [],
      pets: pets ?? [],
      birthdays: birthdays ?? [],
      labels: {
        choreOverdue: (title) => formatMessage(t.attentionChoreOverdue, { title }),
        medicineExpiring: (name) => formatMessage(t.attentionMedicineExpiring, { name }),
        petCareDue: (pet, item) => formatMessage(t.attentionPetCareDue, { pet, item }),
        birthdaySoon: (name, when) => formatMessage(t.attentionBirthdaySoon, { name, when }),
        birthdayToday: t.birthdayToday,
        birthdayInDays: (count) => formatMessage(t.birthdayInDays, { count }),
      },
    });

    if (items.length === 0) continue;

    try {
      const lines = formatAttentionItemsAsLines(items);
      const html = buildReminderDigestHtml({ lines, lang, siteUrl });
      const subject = buildReminderEmailSubject(lang, items.length);
      const result = await sendReminderEmail({ to: email, subject, html });
      if (result.sent) sent += 1;
    } catch (error) {
      errors.push(`${profile.id}: ${error instanceof Error ? error.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors });
}
