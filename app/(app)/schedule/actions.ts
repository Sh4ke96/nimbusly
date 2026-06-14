"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { formatMessage } from "@/lib/i18n/format";
import { buildScheduleChangeSummary, formatScheduleNotificationDetail } from "@/lib/schedule/changes";
import {
  isValidEntryDateString,
  isValidScheduleEntryType,
  parseScheduleEntryFromForm,
  parseScheduleIdFromForm,
} from "@/lib/schedule/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { SCHEDULE_MAX_ENTRIES_PER_DAY } from "@/lib/constants/schedule";
import type { ScheduleEntryType } from "@/lib/constants/schedule";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import { scheduleEntryFromRow } from "@/lib/supabase/app-rows";

async function countScheduleEntriesOnDate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    entryDate: string;
    userId: string;
    familyId: string | null;
    excludeId?: string;
  }
): Promise<number> {
  let query = supabase
    .from("schedule_entries")
    .select("id", { count: "exact", head: true })
    .eq("entry_date", params.entryDate);

  if (params.familyId) {
    query = query.eq("family_id", params.familyId);
  } else {
    query = query.is("family_id", null).eq("created_by", params.userId);
  }

  if (params.excludeId) {
    query = query.neq("id", params.excludeId);
  }

  const { count, error } = await query;
  if (error) return SCHEDULE_MAX_ENTRIES_PER_DAY;

  return count ?? 0;
}

export async function createScheduleEntry(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { entryDate, entryType, description } = parseScheduleEntryFromForm(formData);

  if (!entryDate || !isValidEntryDateString(entryDate)) {
    return { error: t.schedule.errorInvalidDate };
  }
  if (!isValidScheduleEntryType(entryType)) {
    return { error: t.schedule.errorInvalidType };
  }

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  const entriesOnDate = await countScheduleEntriesOnDate(supabase, {
    entryDate,
    userId: user.id,
    familyId,
  });

  if (entriesOnDate >= SCHEDULE_MAX_ENTRIES_PER_DAY) {
    return {
      error: formatMessage(t.schedule.errorTooManyPerDay, {
        max: String(SCHEDULE_MAX_ENTRIES_PER_DAY),
      }),
    };
  }

  const { data: entry, error } = await supabase
    .from("schedule_entries")
    .insert({
      family_id: familyId,
      entry_date: entryDate,
      entry_type: entryType,
      description,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !entry) return { error: t.schedule.errorGeneric };

  if (familyId) {
    const actorName = profile ? getDisplayName(profile) : user.email ?? "Nimbusly";
    const bodyDetail = formatScheduleNotificationDetail(
      entryType as ScheduleEntryType,
      entryDate,
      description,
      t.schedule
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.SCHEDULE_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: bodyDetail,
        payload: {
          schedule_id: entry.id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Entry saved; notifications are best-effort
    }
  }

  return { success: t.schedule.createdSuccess };
}

export async function updateScheduleEntry(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseScheduleIdFromForm(formData);
  const { entryDate, entryType, description } = parseScheduleEntryFromForm(formData);

  if (!id) return { error: t.schedule.errorGeneric };
  if (!entryDate || !isValidEntryDateString(entryDate)) {
    return { error: t.schedule.errorInvalidDate };
  }
  if (!isValidScheduleEntryType(entryType)) {
    return { error: t.schedule.errorInvalidType };
  }

  const { data: existing } = await supabase
    .from("schedule_entries")
    .select("id, entry_date, entry_type, description, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.schedule.errorNotOwner };

  const entriesOnDate = await countScheduleEntriesOnDate(supabase, {
    entryDate,
    userId: user.id,
    familyId: existing.family_id,
    excludeId: id,
  });

  if (entriesOnDate >= SCHEDULE_MAX_ENTRIES_PER_DAY) {
    return {
      error: formatMessage(t.schedule.errorTooManyPerDay, {
        max: String(SCHEDULE_MAX_ENTRIES_PER_DAY),
      }),
    };
  }

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { error } = await supabase
    .from("schedule_entries")
    .update({
      entry_date: entryDate,
      entry_type: entryType,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.schedule.errorGeneric };

  const changeSummary = buildScheduleChangeSummary(
    scheduleEntryFromRow(existing),
    {
      entry_date: entryDate,
      entry_type: entryType as ScheduleEntryType,
      description,
    },
    t.schedule
  );

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.SCHEDULE_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: changeSummary,
        payload: {
          schedule_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Update saved; notifications are best-effort
    }
  }

  return { success: t.schedule.updatedSuccess };
}

export async function deleteScheduleEntry(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseScheduleIdFromForm(formData);
  if (!id) return { error: t.schedule.errorGeneric };

  const { data: existing } = await supabase
    .from("schedule_entries")
    .select("id, entry_date, entry_type, description, family_id, created_by")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.schedule.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { error } = await supabase
    .from("schedule_entries")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.schedule.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatScheduleNotificationDetail(
      existing.entry_type as ScheduleEntryType,
      existing.entry_date,
      existing.description,
      t.schedule
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.SCHEDULE_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: bodyDetail,
        payload: {
          schedule_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Entry deleted; notifications are best-effort
    }
  }

  return { success: t.schedule.deletedSuccess };
}
