"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import { buildNoteChangeSummary, formatNoteNotificationDetail } from "@/lib/notes/changes";
import { isValidNoteIconEmoji, normalizeNoteIconEmoji } from "@/lib/notes/emoji";
import {
  isValidNoteCategoryName,
  isValidNoteContent,
  isValidNoteTitle,
  normalizeNoteCategoryName,
  parseNoteCategoryFromForm,
  parseNoteCategoryRecordIdFromForm,
  parseNoteFromForm,
  parseNoteIdFromForm,
  parseNoteVisibleMemberIdsFromForm,
} from "@/lib/notes/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";

async function resolveVisibleMemberIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  memberIds: string[]
): Promise<string[] | null> {
  if (memberIds.length === 0) return [];

  const unique = [...new Set(memberIds)];
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("family_id", familyId)
    .in("id", unique);

  if (!members || members.length !== unique.length) return null;
  return unique;
}

async function resolveCategoryForScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string | null,
  familyId: string | null,
  userId: string
): Promise<boolean> {
  if (!categoryId) return true;

  let query = supabase.from("note_categories").select("id").eq("id", categoryId);
  if (familyId) {
    query = query.eq("family_id", familyId);
  } else {
    query = query.is("family_id", null).eq("created_by", userId);
  }

  const { data } = await query.maybeSingle();
  return !!data;
}

async function nextCategorySortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string | null,
  userId: string
): Promise<number> {
  let query = supabase.from("note_categories").select("sort_order");
  if (familyId) {
    query = query.eq("family_id", familyId);
  } else {
    query = query.is("family_id", null).eq("created_by", userId);
  }

  const { data } = await query.order("sort_order", { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

export async function createNoteCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const { name, iconEmoji } = parseNoteCategoryFromForm(formData);
  if (!isValidNoteCategoryName(name)) return { error: t.notes.errorCategoryName };
  if (!isValidNoteIconEmoji(iconEmoji)) return { error: t.notes.errorInvalidEmoji };

  const { familyId } = await getProfileFamilyContext(supabase, user.id);
  const sortOrder = await nextCategorySortOrder(supabase, familyId, user.id);

  const { error } = await supabase.from("note_categories").insert({
    family_id: familyId,
    name: normalizeNoteCategoryName(name),
    icon_emoji: normalizeNoteIconEmoji(iconEmoji),
    sort_order: sortOrder,
    created_by: user.id,
  });

  if (error) return { error: t.notes.errorGeneric };
  return { success: t.notes.categoryCreatedSuccess };
}

export async function updateNoteCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseNoteCategoryRecordIdFromForm(formData);
  const { name, iconEmoji } = parseNoteCategoryFromForm(formData);
  if (!id) return { error: t.notes.errorGeneric };
  if (!isValidNoteCategoryName(name)) return { error: t.notes.errorCategoryName };
  if (!isValidNoteIconEmoji(iconEmoji)) return { error: t.notes.errorInvalidEmoji };

  const { error } = await supabase
    .from("note_categories")
    .update({
      name: normalizeNoteCategoryName(name),
      icon_emoji: normalizeNoteIconEmoji(iconEmoji),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.notes.errorGeneric };
  return { success: t.notes.categoryUpdatedSuccess };
}

export async function deleteNoteCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseNoteCategoryRecordIdFromForm(formData);
  if (!id) return { error: t.notes.errorGeneric };

  const { error } = await supabase
    .from("note_categories")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.notes.errorGeneric };
  return { success: t.notes.categoryDeletedSuccess };
}

export async function createNote(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const { title, content, categoryId, isPinned, contentFormat } = parseNoteFromForm(formData);
  if (!isValidNoteTitle(title)) return { error: t.notes.errorTitleRequired };
  if (!isValidNoteContent(content)) return { error: t.notes.errorContentTooLong };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  if (!(await resolveCategoryForScope(supabase, categoryId, familyId, user.id))) {
    return { error: t.notes.errorInvalidCategory };
  }

  let visibleToMemberIds: string[] = [];
  if (familyId) {
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
      content_format: contentFormat,
      is_pinned: isPinned,
      visible_to_member_ids: visibleToMemberIds,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !note) return { error: t.notes.errorGeneric };

  if (familyId) {
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
      // Saved; notifications are best-effort
    }
  }

  return { success: t.notes.createdSuccess };
}

export async function updateNote(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseNoteIdFromForm(formData);
  const { title, content, categoryId, isPinned, contentFormat } = parseNoteFromForm(formData);
  if (!id) return { error: t.notes.errorGeneric };
  if (!isValidNoteTitle(title)) return { error: t.notes.errorTitleRequired };
  if (!isValidNoteContent(content)) return { error: t.notes.errorContentTooLong };

  const { data: existing } = await supabase
    .from("notes")
    .select(
      "id, title, content, category_id, visible_to_member_ids, family_id, created_by"
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.notes.errorNotOwner };

  if (
    !(await resolveCategoryForScope(
      supabase,
      categoryId,
      existing.family_id,
      user.id
    ))
  ) {
    return { error: t.notes.errorInvalidCategory };
  }

  let visibleToMemberIds: string[] = existing.visible_to_member_ids ?? [];
  if (existing.family_id) {
    const visibleRaw = parseNoteVisibleMemberIdsFromForm(formData);
    if (visibleRaw === null) return { error: t.notes.errorInvalidVisibility };
    const resolved = await resolveVisibleMemberIds(
      supabase,
      existing.family_id,
      visibleRaw
    );
    if (resolved === null) return { error: t.notes.errorInvalidVisibility };
    visibleToMemberIds = resolved;
  }

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { data: categories } = existing.family_id
    ? await supabase.from("note_categories").select("*").eq("family_id", existing.family_id)
    : await supabase
        .from("note_categories")
        .select("*")
        .is("family_id", null)
        .eq("created_by", user.id);

  const { error } = await supabase
    .from("notes")
    .update({
      title: title.trim(),
      content,
      category_id: categoryId,
      content_format: contentFormat,
      is_pinned: isPinned,
      visible_to_member_ids: visibleToMemberIds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.notes.errorGeneric };

  const changeSummary = buildNoteChangeSummary(
    existing,
    {
      title: title.trim(),
      content,
      category_id: categoryId,
      visible_to_member_ids: visibleToMemberIds,
    },
    categories ?? [],
    t.notes
  );

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.NOTE_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: changeSummary,
        payload: {
          note_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds:
          visibleToMemberIds.length > 0 ? visibleToMemberIds : undefined,
      });
    } catch {
      // Update saved; notifications are best-effort
    }
  }

  return { success: t.notes.updatedSuccess };
}

export async function deleteNote(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseNoteIdFromForm(formData);
  if (!id) return { error: t.notes.errorGeneric };

  const { data: existing } = await supabase
    .from("notes")
    .select("id, title, content, family_id, created_by, visible_to_member_ids")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.notes.errorNotOwner };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.notes.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatNoteNotificationDetail(
      existing.title,
      existing.content,
      t.notes
    );
    const visibleToMemberIds = existing.visible_to_member_ids ?? [];

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.NOTE_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: bodyDetail,
        payload: {
          note_id: id,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
        onlyRecipientIds:
          visibleToMemberIds.length > 0 ? visibleToMemberIds : undefined,
      });
    } catch {
      // Deleted; notifications are best-effort
    }
  }

  return { success: t.notes.deletedSuccess };
}

export async function toggleNotePinned(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseNoteIdFromForm(formData);
  if (!id) return { error: t.notes.errorGeneric };

  const { data: existing } = await supabase
    .from("notes")
    .select("id, is_pinned")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!existing) return { error: t.notes.errorNotOwner };

  const { error } = await supabase
    .from("notes")
    .update({
      is_pinned: !existing.is_pinned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) return { error: t.notes.errorGeneric };
  return { success: t.notes.pinToggledSuccess };
}
