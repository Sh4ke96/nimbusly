"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { buildChoreChangeSummary, formatChoreNotificationDetail } from "@/lib/chores/changes";
import {
  CHORE_RECURRENCE,
  CHORE_STATUS,
  type ChoreStatus,
} from "@/lib/constants/chores";
import {
  computeChoreStateAfterOccurrenceComplete,
  isChoreOccurrenceCompleted,
  isOccurrenceInChoreSeries,
  resolveOccurrenceDateToComplete,
} from "@/lib/chores/completion";
import { resolveChoreRecurrenceFields } from "@/lib/chores/recurrence";
import {
  isValidChoreDateString,
  isValidChoreCustomRecurrence,
  isValidChoreNotes,
  isValidChoreStatus,
  isValidChoreTitle,
  normalizeChoreTitle,
  CHORE_FORM_FIELD,
  parseChoreIdFromForm,
  parseChoreOccurrenceCompleteFromForm,
  parseChoreStatusFromForm,
  parseChoreTaskFromForm,
} from "@/lib/chores/types";
import { isValidChoreIconEmoji } from "@/lib/chores/emoji";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName, type Profile } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { getProfileFamilyContext, requireUser } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import { resolveAssigneeNotificationRecipients } from "@/lib/family/assignee-visibility";
import { choreTaskFromRow } from "@/lib/supabase/app-rows";

async function validateAssignee(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assignedTo: string | null,
  familyId: string | null
): Promise<boolean> {
  if (!assignedTo) return true;
  if (!familyId) return assignedTo === null;
  const { data: member } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", assignedTo)
    .eq("family_id", familyId)
    .maybeSingle();
  return !!member;
}

function resolveAssigneeLabel(
  id: string | null,
  profile: Pick<Profile, "id" | "first_name" | "last_name"> | null,
  members: { id: string; first_name: string | null; last_name: string | null }[],
  unassignedLabel: string
): string {
  if (!id) return unassignedLabel;
  if (profile && profile.id === id) {
    return getDisplayName({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
    });
  }
  const member = members.find((m) => m.id === id);
  if (!member) return unassignedLabel;
  return getDisplayName({
    first_name: member.first_name ?? "",
    last_name: member.last_name ?? "",
  });
}

function validateChoreFields(
  parsed: ReturnType<typeof parseChoreTaskFromForm>
): string | null {
  if (!isValidChoreTitle(parsed.title)) return "title";
  if (!parsed.status) return "status";
  if (!parsed.recurrence) return "recurrence";
  if (!isValidChoreCustomRecurrence(
    parsed.recurrence,
    parsed.recurrenceIntervalDays,
    parsed.recurrenceDuration
  )) {
    return parsed.recurrence === CHORE_RECURRENCE.CUSTOM
      ? "customRecurrence"
      : "recurrenceDuration";
  }
  if (
    parsed.recurrence !== CHORE_RECURRENCE.NONE &&
    !parsed.dueDate
  ) {
    return "recurrenceStartDate";
  }
  if (!isValidChoreNotes(parsed.notes)) return "notes";
  if (!isValidChoreIconEmoji(parsed.iconEmoji)) return "iconEmoji";
  if (!isValidChoreDateString(parsed.dueDate)) return "dueDate";
  return null;
}

function toChorePayload(parsed: ReturnType<typeof parseChoreTaskFromForm>) {
  const recurrenceFields = resolveChoreRecurrenceFields(
    parsed.recurrence!,
    parsed.recurrenceIntervalDays,
    parsed.recurrenceDuration,
    parsed.dueDate
  );

  return {
    title: normalizeChoreTitle(parsed.title),
    notes: parsed.notes,
    icon_emoji: parsed.iconEmoji,
    status: parsed.status!,
    assigned_to: parsed.assignedTo,
    due_date: parsed.dueDate,
    recurrence: parsed.recurrence!,
    ...recurrenceFields,
  };
}

export async function createChoreTask(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parseChoreTaskFromForm(formData);
  const validationError = validateChoreFields(parsed);
  if (validationError === "title") return { error: t.chores.errorTitleRequired };
  if (validationError === "status") return { error: t.chores.errorStatusRequired };
  if (validationError === "recurrence") return { error: t.chores.errorRecurrenceRequired };
  if (validationError === "customRecurrence") {
    return { error: t.chores.errorCustomRecurrenceRequired };
  }
  if (validationError === "recurrenceDuration") {
    return { error: t.chores.errorRecurrenceDurationRequired };
  }
  if (validationError === "recurrenceStartDate") {
    return { error: t.chores.errorRecurrenceStartDateRequired };
  }
  if (validationError === "iconEmoji") return { error: t.chores.errorInvalidIconEmoji };
  if (validationError === "dueDate") return { error: t.chores.errorInvalidDueDate };
  if (validationError) return { error: t.chores.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  if (!(await validateAssignee(supabase, parsed.assignedTo, familyId))) {
    return { error: t.chores.errorInvalidAssignee };
  }

  const payload = toChorePayload(parsed);

  const { data: task, error } = await supabase
    .from("chore_tasks")
    .insert({
      family_id: familyId,
      ...payload,
      completed_at: payload.status === CHORE_STATUS.COMPLETED ? new Date().toISOString() : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !task) return { error: t.chores.errorGeneric };

  if (familyId && profile) {
    const bodyDetail = formatChoreNotificationDetail(
      payload.title,
      t.chores.statusLabels[payload.status],
      t.chores
    );
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.CHORE_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: bodyDetail,
        payload: { chore_task_id: task.id, actor_id: user.id, family_id: familyId },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(parsed.assignedTo),
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.chores.createdSuccess };
}

export async function updateChoreTask(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseChoreIdFromForm(formData);
  const parsed = parseChoreTaskFromForm(formData);
  const validationError = validateChoreFields(parsed);
  if (!id) return { error: t.chores.errorGeneric };
  if (validationError === "title") return { error: t.chores.errorTitleRequired };
  if (validationError === "status") return { error: t.chores.errorStatusRequired };
  if (validationError === "recurrence") return { error: t.chores.errorRecurrenceRequired };
  if (validationError === "customRecurrence") {
    return { error: t.chores.errorCustomRecurrenceRequired };
  }
  if (validationError === "recurrenceDuration") {
    return { error: t.chores.errorRecurrenceDurationRequired };
  }
  if (validationError === "recurrenceStartDate") {
    return { error: t.chores.errorRecurrenceStartDateRequired };
  }
  if (validationError === "iconEmoji") return { error: t.chores.errorInvalidIconEmoji };
  if (validationError === "dueDate") return { error: t.chores.errorInvalidDueDate };
  if (validationError) return { error: t.chores.errorGeneric };

  const { data: existing } = await supabase
    .from("chore_tasks")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.chores.errorNotOwner };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  if (!(await validateAssignee(supabase, parsed.assignedTo, familyId))) {
    return { error: t.chores.errorInvalidAssignee };
  }

  const payload = toChorePayload(parsed);
  const completedAt =
    payload.status === CHORE_STATUS.COMPLETED ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("chore_tasks")
    .update({
      ...payload,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.chores.errorGeneric };

  if (familyId && profile) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("family_id", familyId);

    const changeSummary = buildChoreChangeSummary(
      choreTaskFromRow(existing),
      { ...choreTaskFromRow(existing), ...payload },
      t.chores,
      (assigneeId) =>
        resolveAssigneeLabel(assigneeId, profile, members ?? [], t.chores.assigneeUnassigned)
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.CHORE_UPDATED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: changeSummary,
        payload: {
          chore_task_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
        },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(
          payload.assigned_to ?? existing.assigned_to
        ),
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.chores.updatedSuccess };
}

export async function completeChoreOccurrence(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const { id, occurrenceDate } = parseChoreOccurrenceCompleteFromForm(formData);
  if (!id || !isValidChoreDateString(occurrenceDate)) {
    return { error: t.chores.errorInvalidOccurrenceDate };
  }

  const { data: existing } = await supabase
    .from("chore_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: t.chores.errorNotOwner };

  if (existing.family_id === null && existing.created_by !== user.id) {
    return { error: t.chores.errorNotOwner };
  }

  const chore = choreTaskFromRow(existing);

  if (!isOccurrenceInChoreSeries(chore, occurrenceDate)) {
    return { error: t.chores.errorInvalidOccurrenceDate };
  }

  if (isChoreOccurrenceCompleted(chore, occurrenceDate)) {
    return { success: t.chores.completedOccurrenceSuccess };
  }

  const next = computeChoreStateAfterOccurrenceComplete(chore, occurrenceDate);

  const { error } = await supabase
    .from("chore_tasks")
    .update({
      completed_dates: next.completed_dates,
      due_date: next.due_date,
      status: next.status,
      completed_at: next.completed_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: t.chores.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  if (familyId && profile) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("family_id", familyId);

    const after = { ...chore, ...next };
    const changeSummary = buildChoreChangeSummary(
      chore,
      after,
      t.chores,
      (assigneeId) =>
        resolveAssigneeLabel(assigneeId, profile, members ?? [], t.chores.assigneeUnassigned)
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.CHORE_UPDATED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: changeSummary,
        payload: {
          chore_task_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
        },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(chore.assigned_to),
      });
    } catch {
      // Best-effort
    }
  }

  return {
    success:
      next.status === CHORE_STATUS.COMPLETED
        ? t.chores.completedSuccess
        : t.chores.completedOccurrenceSuccess,
  };
}

export async function setChoreTaskStatus(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const { id, status: statusRaw } = parseChoreStatusFromForm(formData);

  if (!id || !isValidChoreStatus(statusRaw)) {
    return { error: t.chores.errorStatusRequired };
  }

  const { data: existing } = await supabase
    .from("chore_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return { error: t.chores.errorNotOwner };

  if (existing.family_id === null && existing.created_by !== user.id) {
    return { error: t.chores.errorNotOwner };
  }
  if (existing.status === statusRaw) return { success: t.chores.updatedSuccess };

  const status = statusRaw as ChoreStatus;
  const markingCompleted = status === CHORE_STATUS.COMPLETED;

  if (markingCompleted) {
    const chore = choreTaskFromRow(existing);
    const occurrenceDate =
      chore.recurrence !== CHORE_RECURRENCE.NONE || chore.due_date
        ? resolveOccurrenceDateToComplete(chore)
        : null;

    if (occurrenceDate) {
      const completeForm = new FormData();
      completeForm.set(CHORE_FORM_FIELD.ID, id);
      completeForm.set(CHORE_FORM_FIELD.OCCURRENCE_DATE, occurrenceDate);
      return completeChoreOccurrence(_prev, completeForm);
    }
  }

  const completedAt =
    markingCompleted ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("chore_tasks")
    .update({
      status,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: t.chores.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  if (familyId && profile) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("family_id", familyId);

    const chore = choreTaskFromRow(existing);
    const after = { ...chore, status };
    const changeSummary = buildChoreChangeSummary(
      chore,
      after,
      t.chores,
      (assigneeId) =>
        resolveAssigneeLabel(assigneeId, profile, members ?? [], t.chores.assigneeUnassigned)
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.CHORE_UPDATED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: changeSummary,
        payload: {
          chore_task_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
        },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(existing.assigned_to),
      });
    } catch {
      // Best-effort
    }
  }

  if (markingCompleted) {
    return { success: t.chores.completedSuccess };
  }

  return { success: t.chores.updatedSuccess };
}

export async function deleteChoreTask(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseChoreIdFromForm(formData);
  if (!id) return { error: t.chores.errorGeneric };

  const { data: existing } = await supabase
    .from("chore_tasks")
    .select("id, title, status, family_id, created_by, assigned_to")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.chores.errorNotOwner };

  const { error } = await supabase
    .from("chore_tasks")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.chores.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  if (familyId && profile && isValidChoreStatus(existing.status)) {
    const bodyDetail = formatChoreNotificationDetail(
      existing.title,
      t.chores.statusLabels[existing.status],
      t.chores
    );
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.CHORE_DELETED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: bodyDetail,
        payload: { chore_task_id: id, actor_id: user.id, family_id: familyId },
        onlyRecipientIds: resolveAssigneeNotificationRecipients(existing.assigned_to),
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.chores.deletedSuccess };
}
