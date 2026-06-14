import { formatBirthdayLabel, isValidBirthDate, parseBirthdayFromForm } from "@/lib/birthdays/types";
import { NOTIFICATION_TYPE, type NotificationType } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import { getProfileFamilyContext } from "@/lib/server-actions/require-user";
import type { AccountActionState } from "@/app/(app)/account/actions";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

type NotifyFamilyMembers = (
  supabase: AppSupabase,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    familyId: string;
    body: string;
    payload: Record<string, unknown>;
  }
) => Promise<void>;

export type CreateBirthdayContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  notifyFamilyMembers?: NotifyFamilyMembers;
};

export async function executeCreateBirthday(
  { t, user, supabase, notifyFamilyMembers }: CreateBirthdayContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const { personName, birthMonth, birthDay, description } = parseBirthdayFromForm(formData);

  if (!personName) return { error: t.birthdays.errorPersonName };
  if (!isValidBirthDate(birthMonth, birthDay)) {
    return { error: t.birthdays.errorInvalidDate };
  }

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  const { data: birthday, error } = await supabase
    .from("birthday_entries")
    .insert({
      family_id: familyId,
      person_name: personName,
      birth_month: birthMonth,
      birth_day: birthDay,
      birth_year: null,
      description,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !birthday) return { error: t.birthdays.errorGeneric };

  if (familyId && notifyFamilyMembers) {
    const actorName = profile ? getDisplayName(profile) : user.email ?? "Nimbusly";
    const dateLabel = formatBirthdayLabel({
      birth_month: birthMonth,
      birth_day: birthDay,
    } as Parameters<typeof formatBirthdayLabel>[0]);

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.BIRTHDAY_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${personName}${t.notifications.notificationBodySeparator}${dateLabel}`,
        payload: {
          birthday_id: birthday.id,
          person_name: personName,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Birthday saved; notifications are best-effort
    }
  }

  return { success: t.birthdays.createdSuccess };
}
