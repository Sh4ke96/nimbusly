import {
  isValidNoteContent,
  isValidNoteTitle,
  parseNoteFromForm,
  parseNoteVisibleMemberIdsFromForm,
} from "@/lib/notes/types";
import { formatNoteNotificationDetail } from "@/lib/notes/changes";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
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
    type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
    actorId: string;
    actorName: string;
    familyId: string;
    body: string;
    payload: Record<string, unknown>;
    onlyRecipientIds?: string[];
  }
) => Promise<void>;

export type CreateNoteContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  notifyFamilyMembers?: NotifyFamilyMembers;
  resolveCategoryForScope?: (
    supabase: AppSupabase,
    categoryId: string | null,
    familyId: string | null,
    userId: string
  ) => Promise<boolean>;
  resolveVisibleMemberIds?: (
    supabase: AppSupabase,
    familyId: string,
    memberIds: string[]
  ) => Promise<string[] | null>;
};

export async function executeCreateNote(
  {
    t,
    user,
    supabase,
    notifyFamilyMembers,
    resolveCategoryForScope,
    resolveVisibleMemberIds,
  }: CreateNoteContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const { title, content, categoryId } = parseNoteFromForm(formData);
  if (!isValidNoteTitle(title)) return { error: t.notes.errorTitleRequired };
  if (!isValidNoteContent(content)) return { error: t.notes.errorContentTooLong };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  if (resolveCategoryForScope) {
    if (!(await resolveCategoryForScope(supabase, categoryId, familyId, user.id))) {
      return { error: t.notes.errorInvalidCategory };
    }
  }

  let visibleToMemberIds: string[] = [];
  if (familyId && resolveVisibleMemberIds) {
    const visibleRaw = parseNoteVisibleMemberIdsFromForm(formData);
    if (visibleRaw === null) return { error: t.notes.errorInvalidVisibility };
    const resolved = await resolveVisibleMemberIds(supabase, familyId, visibleRaw);
    if (resolved === null) return { error: t.notes.errorInvalidVisibility };
    visibleToMemberIds = resolved;
  }

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      family_id: familyId,
      category_id: categoryId,
      title: title.trim(),
      content,
      visible_to_member_ids: visibleToMemberIds,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !note) return { error: t.notes.errorGeneric };

  if (familyId && notifyFamilyMembers) {
    const actorName = profile ? getDisplayName(profile) : user.email ?? "Nimbusly";
    const bodyDetail = formatNoteNotificationDetail(title.trim(), content, t.notes);

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.NOTE_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: bodyDetail,
        payload: {
          note_id: note.id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds:
          visibleToMemberIds.length > 0 ? visibleToMemberIds : undefined,
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.notes.createdSuccess };
}
