import { NextResponse } from "next/server";
import { isValidCronAuthorization } from "@/lib/auth/verify-cron-secret";
import { buildAttentionItems } from "@/lib/dashboard/attention";
import { dict } from "@/lib/i18n";
import { LANG, type Lang } from "@/lib/constants/lang";
import { formatMessage } from "@/lib/i18n/format";
import {
  filterAttentionItemsForDigest,
  groupNotificationsForDigest,
  hasDigestContent,
} from "@/lib/notifications/daily-digest/build-daily-digest";
import {
  buildDailyDigestHtml,
  buildDailyDigestSubject,
} from "@/lib/notifications/daily-digest/format-daily-digest-email";
import { formatAttentionItemsAsLines } from "@/lib/notifications/reminder-digest";
import { sendReminderEmail } from "@/lib/notifications/send-email";
import { DEV_SITE_URL } from "@/lib/constants/dev";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  canViewBudgetForMember,
  canViewMemberVisibilityRow,
  filterAssigneeScopedRows,
} from "@/lib/family/assignee-visibility";
import { loadAllModulePreferencesForUser } from "@/lib/notifications/module-preferences/load-module-preferences";
import type { AppNotification } from "@/lib/notifications/types";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";

function scopeFilter(familyId: string | null, userId: string) {
  return familyId
    ? { column: "family_id" as const, value: familyId }
    : { column: "created_by" as const, value: userId };
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!isValidCronAuthorization(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ sent: 0, skipped: true, reason: "RESEND_API_KEY missing" });
  }

  const supabase = createServiceRoleClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEV_SITE_URL;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, family_id, first_name, last_name, preferred_lang, email_digest_enabled");

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles ?? []) {
    if (profile.email_digest_enabled === false) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    const email = authUser.user?.email;
    if (!email) continue;

    const preferences = await loadAllModulePreferencesForUser(supabase, profile.id);
    const hasEmailModule = preferences.some((pref) => pref.emailDigestEnabled);
    if (!hasEmailModule) continue;

    const scope = scopeFilter(profile.family_id, profile.id);
    const lang: Lang =
      profile.preferred_lang === LANG.EN ? LANG.EN : LANG.PL;
    const t = dict[lang].dashboard;
    const moduleLabels = dict[lang].dashboard.moduleLabels as Record<
      NotificationModuleId,
      string
    >;

    const [
      { data: choreTasks },
      { data: medicineItems },
      { data: careItems },
      { data: pets },
      { data: birthdays },
      { data: budgetExpenses },
      { data: scheduleEntries },
      { data: notes },
      { data: recentNotifications },
    ] = await Promise.all([
      supabase.from("chore_tasks").select("*").eq(scope.column, scope.value),
      supabase.from("medicine_items").select("*").eq(scope.column, scope.value),
      supabase.from("pet_care_items").select("*").eq(scope.column, scope.value),
      supabase.from("pets").select("*").eq(scope.column, scope.value),
      supabase.from("birthday_entries").select("*").eq(scope.column, scope.value),
      supabase.from("budget_expenses").select("*").eq(scope.column, scope.value),
      supabase.from("schedule_entries").select("*").eq(scope.column, scope.value),
      supabase.from("notes").select("*").eq(scope.column, scope.value),
      supabase
        .from("notifications")
        .select("id, user_id, type, title, body, payload, read_at, created_at")
        .eq("user_id", profile.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    let digestChoreTasks = choreTasks ?? [];
    let digestMedicineItems = medicineItems ?? [];
    let digestNotes = notes ?? [];
    let digestBudgetExpenses = budgetExpenses ?? [];

    if (profile.family_id) {
      digestChoreTasks = filterAssigneeScopedRows(digestChoreTasks, profile.id, "assigned_to");
      digestMedicineItems = filterAssigneeScopedRows(digestMedicineItems, profile.id, "taken_by");
      digestNotes = digestNotes.filter((note) =>
        canViewMemberVisibilityRow(note, profile.id)
      );

      const { data: familyBudgets } = await supabase
        .from("budgets")
        .select("id, created_by")
        .eq("family_id", profile.family_id);
      const budgetIds = (familyBudgets ?? []).map((budget) => budget.id as string);
      const membersByBudgetId = new Map<string, string[]>();

      if (budgetIds.length > 0) {
        const { data: budgetMembers } = await supabase
          .from("budget_members")
          .select("budget_id, member_id")
          .in("budget_id", budgetIds);

        for (const row of budgetMembers ?? []) {
          const budgetId = row.budget_id as string;
          const list = membersByBudgetId.get(budgetId) ?? [];
          list.push(row.member_id as string);
          membersByBudgetId.set(budgetId, list);
        }
      }

      const accessibleBudgetIds = new Set(
        (familyBudgets ?? [])
          .filter((budget) =>
            canViewBudgetForMember({
              createdBy: budget.created_by as string,
              viewerId: profile.id,
              memberIds: membersByBudgetId.get(budget.id as string) ?? [],
            })
          )
          .map((budget) => budget.id as string)
      );

      digestBudgetExpenses = digestBudgetExpenses.filter((expense) =>
        accessibleBudgetIds.has(expense.budget_id as string)
      );
    }

    const attentionItems = filterAttentionItemsForDigest(
      buildAttentionItems({
        choreTasks: digestChoreTasks,
        medicineItems: digestMedicineItems,
        careItems: careItems ?? [],
        pets: pets ?? [],
        birthdays: birthdays ?? [],
        budgetExpenses: digestBudgetExpenses,
        scheduleEntries: scheduleEntries ?? [],
        notes: digestNotes,
        labels: {
          choreOverdue: (title) => formatMessage(t.attentionChoreOverdue, { title }),
          medicineExpiring: (name) => formatMessage(t.attentionMedicineExpiring, { name }),
          petCareDue: (pet, item) => formatMessage(t.attentionPetCareDue, { pet, item }),
          birthdaySoon: (name, when) => formatMessage(t.attentionBirthdaySoon, { name, when }),
          birthdayToday: t.birthdayToday,
          birthdayInDays: (count) => formatMessage(t.birthdayInDays, { count }),
          budgetPaymentDue: (description) =>
            formatMessage(t.attentionBudgetPaymentDue, { description }),
          scheduleEnding: (description) =>
            formatMessage(t.attentionScheduleEnding, { description }),
          noteUrgent: (title) => formatMessage(t.attentionNoteUrgent, { title }),
        },
      }),
      preferences
    );

    const activitySections = groupNotificationsForDigest(
      (recentNotifications ?? []) as AppNotification[],
      preferences
    ).map((section) => ({
      ...section,
      title: moduleLabels[section.moduleId] ?? section.moduleId,
    }));

    const attentionLines = formatAttentionItemsAsLines(attentionItems);
    const sections = activitySections.filter((section) => section.lines.length > 0);

    if (!hasDigestContent(sections) && attentionLines.length === 0) continue;

    const itemCount = attentionLines.length + sections.reduce((sum, s) => sum + s.lines.length, 0);

    try {
      const html = buildDailyDigestHtml({
        attentionLines,
        activitySections: sections,
        moduleLabels,
        lang,
        siteUrl,
      });
      const subject = buildDailyDigestSubject(lang, itemCount);
      const result = await sendReminderEmail({ to: email, subject, html });
      if (result.sent) sent += 1;
    } catch (error) {
      errors.push(`${profile.id}: ${error instanceof Error ? error.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors });
}
