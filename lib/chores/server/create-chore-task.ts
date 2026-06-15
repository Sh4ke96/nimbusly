import { CHORE_RECURRENCE } from "@/lib/constants/chores";
import { isValidChoreIconEmoji } from "@/lib/chores/emoji";
import { resolveChoreRecurrenceFields } from "@/lib/chores/recurrence";
import {
  isValidChoreCustomRecurrence,
  isValidChoreDateString,
  isValidChoreNotes,
  isValidChoreTitle,
  normalizeChoreTitle,
  parseChoreTaskFromForm,
} from "@/lib/chores/types";
import { getProfileFamilyContext } from "@/lib/server-actions/require-user";
import type { AccountActionState } from "@/app/(app)/account/actions";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type CreateChoreTaskContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  validateAssignee?: (
    supabase: AppSupabase,
    assignedTo: string | null,
    familyId: string | null
  ) => Promise<boolean>;
};

function validateChoreFields(parsed: ReturnType<typeof parseChoreTaskFromForm>): string | null {
  if (!isValidChoreTitle(parsed.title)) return "title";
  if (!parsed.status) return "status";
  if (!parsed.recurrence) return "recurrence";
  if (
    !isValidChoreCustomRecurrence(
      parsed.recurrence,
      parsed.recurrenceIntervalDays,
      parsed.recurrenceDuration
    )
  ) {
    return parsed.recurrence === CHORE_RECURRENCE.CUSTOM
      ? "customRecurrence"
      : "recurrenceDuration";
  }
  if (parsed.recurrence !== CHORE_RECURRENCE.NONE && !parsed.dueDate) {
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

export async function executeCreateChoreTask(
  { t, user, supabase, validateAssignee }: CreateChoreTaskContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parseChoreTaskFromForm(formData);
  const validationError = validateChoreFields(parsed);
  if (validationError === "title") return { error: t.chores.errorTitleRequired };
  if (validationError === "status") return { error: t.chores.errorStatusRequired };
  if (validationError === "recurrence") return { error: t.chores.errorRecurrenceRequired };
  if (validationError) return { error: t.chores.errorGeneric };

  const { familyId } = await getProfileFamilyContext(supabase, user.id);
  if (validateAssignee && !(await validateAssignee(supabase, parsed.assignedTo, familyId))) {
    return { error: t.chores.errorInvalidAssignee };
  }

  const payload = toChorePayload(parsed);
  const { data: task, error } = await supabase
    .from("chore_tasks")
    .insert({
      family_id: familyId,
      ...payload,
      completed_at: null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !task) return { error: t.chores.errorGeneric };
  return { success: t.chores.createdSuccess };
}
