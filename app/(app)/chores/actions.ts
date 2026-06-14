"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { buildChoreChangeSummary, formatChoreNotificationDetail } from "@/lib/chores/changes";
import {
  CHORE_RECURRENCE,
  CHORE_STATUS,
  type ChoreRecurrence,
  type ChoreStatus,
} from "@/lib/constants/chores";
import {
  computeNextChoreDueDate,
  dateToChoreDateString,
  isValidChoreDateString,
  isValidChoreNotes,
  isValidChoreStatus,
  isValidChoreTitle,
  normalizeChoreTitle,
  parseChoreDateString,
  parseChoreIdFromForm,
  parseChoreStatusFromForm,
  parseChoreTaskFromForm,
} from "@/lib/chores/types";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName, type Profile } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { getProfileFamilyContext, requireUser } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
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
  if (!isValidChoreNotes(parsed.notes)) return "notes";
  if (!isValidChoreDateString(parsed.dueDate)) return "dueDate";
  return null;
}

function toChorePayload(parsed: ReturnType<typeof parseChoreTaskFromForm>) {
  return {
    title: normalizeChoreTitle(parsed.title),
    notes: parsed.notes,
    status: parsed.status!,
    assigned_to: parsed.assignedTo,
    due_date: parsed.dueDate,
    recurrence: parsed.recurrence!,
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
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.chores.updatedSuccess };
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
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.chores.errorNotOwner };
  if (existing.status === statusRaw) return { success: t.chores.updatedSuccess };

  const status = statusRaw as ChoreStatus;
  const markingCompleted = status === CHORE_STATUS.COMPLETED;
  let nextStatus = status;
  let dueDate = existing.due_date;
  let completedAt: string | null = markingCompleted ? new Date().toISOString() : null;
  let completedWithRecurrence = false;

  if (markingCompleted && existing.recurrence !== CHORE_RECURRENCE.NONE) {
    const base = existing.due_date
      ? parseChoreDateString(existing.due_date) ?? new Date()
      : new Date();
    const next = computeNextChoreDueDate(base, existing.recurrence as ChoreRecurrence);
    nextStatus = CHORE_STATUS.PENDING;
    dueDate = next ? dateToChoreDateString(next) : null;
    completedAt = null;
    completedWithRecurrence = true;
  }

  const { error } = await supabase
    .from("chore_tasks")
    .update({
      status: nextStatus,
      due_date: dueDate,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.chores.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  if (familyId && profile) {
    const { data: members } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("family_id", familyId);

    const chore = choreTaskFromRow(existing);
    const after = { ...chore, status: nextStatus, due_date: dueDate };
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
      });
    } catch {
      // Best-effort
    }
  }

  if (markingCompleted) {
    return {
      success: completedWithRecurrence
        ? t.chores.completedRecurrenceSuccess
        : t.chores.completedSuccess,
    };
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
    .select("id, title, status, family_id, created_by")
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
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.chores.deletedSuccess };
}
