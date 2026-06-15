"use server";

import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/i18n/server";
import {
  buildShoppingListChangeSummary,
  formatShoppingListItemNotificationDetail,
  formatShoppingListNotificationDetail,
} from "@/lib/shopping-lists/changes";
import {
  isValidShoppingItemContent,
  isValidShoppingItemQuantity,
  isValidShoppingListName,
  normalizeShoppingItemContent,
  normalizeShoppingListName,
  parseOrderedItemIds,
  parseShoppingCheckedFromForm,
  parseShoppingItemFromForm,
  parseShoppingItemIdsFromForm,
  parseShoppingItemUpdateFromForm,
  parseShoppingListIdFromForm,
  parseShoppingListNameFromForm,
  parseShoppingListWatchFromForm,
  parseShoppingReorderFromForm,
} from "@/lib/shopping-lists/types";
import {
  parseOrderedCategoryIds,
  parseShoppingCategoryReorderFromForm,
} from "@/lib/shopping-lists/categories";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTIFICATION_TYPE, type NotificationType } from "@/lib/constants/notifications";
import { getFamilyNotificationTitle } from "@/lib/notifications/family-notification";
import { getDisplayName } from "@/lib/profile";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser, getActorProfile, getProfileFamilyContext } from "@/lib/server-actions/require-user";
import { notifyEntityWatchers } from "@/lib/server-actions/notify-watchers";
import { notifyFamilyMembers } from "@/lib/server-actions/notify-family";
import type { ShoppingListItemUpdate } from "@/lib/supabase/app-rows";
import { executeCreateShoppingList } from "@/lib/shopping-lists/server/create-shopping-list";

async function notifyWatchersAboutListItemEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    type: NotificationType;
    actorId: string;
    actorName: string;
    listId: string;
    listName: string;
    familyId: string | null;
    bodyDetail: string;
    itemContent: string;
  }
) {
  const t = await getServerT();
  const title = getFamilyNotificationTitle(params.type, t.notifications, params.actorName);
  const body = `${params.listName}${t.notifications.notificationBodySeparator}${params.bodyDetail}`;

  await notifyEntityWatchers(supabase, {
    watchTable: "shopping_list_watches",
    entityColumn: "list_id",
    entityId: params.listId,
    actorId: params.actorId,
    type: params.type,
    title,
    body,
    payload: {
      shopping_list_id: params.listId,
      list_name: params.listName,
      item_content: params.itemContent,
      actor_id: params.actorId,
      family_id: params.familyId,
      updated_at: new Date().toISOString(),
    },
  });
}

async function getAccessibleList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listId: string
) {
  const { data } = await supabase
    .from("shopping_lists")
    .select("id, name, family_id, created_by")
    .eq("id", listId)
    .maybeSingle();

  return data;
}

async function getFamilyCategoryId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string | null,
  familyId: string | null
): Promise<string | null> {
  if (!categoryId) return null;
  if (!familyId) return null;

  const { data } = await supabase
    .from("shopping_list_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("family_id", familyId)
    .maybeSingle();

  return data?.id ?? null;
}

export async function createShoppingList(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  return executeCreateShoppingList(
    { t, user, supabase, notifyFamilyMembers },
    formData
  );
}

export async function updateShoppingList(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseShoppingListIdFromForm(formData);
  const name = normalizeShoppingListName(parseShoppingListNameFromForm(formData).name);

  if (!id) return { error: t.shoppingLists.errorGeneric };
  if (!isValidShoppingListName(name)) {
    return { error: t.shoppingLists.errorNameRequired };
  }

  const existing = await getAccessibleList(supabase, id);
  if (!existing) return { error: t.shoppingLists.errorNotFound };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { error } = await supabase
    .from("shopping_lists")
    .update({
      name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: t.shoppingLists.errorGeneric };

  const changeSummary = buildShoppingListChangeSummary(existing, { name }, t.shoppingLists);
  const familyId = existing.family_id;

  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.SHOPPING_LIST_UPDATED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${name}${t.notifications.notificationBodySeparator}${changeSummary}`,
        payload: {
          shopping_list_id: id,
          list_name: name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: changeSummary,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Updated; notifications are best-effort
    }
  }

  return { success: t.shoppingLists.updatedSuccess };
}

export async function deleteShoppingList(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const id = parseShoppingListIdFromForm(formData);
  if (!id) return { error: t.shoppingLists.errorGeneric };

  const existing = await getAccessibleList(supabase, id);
  if (!existing) return { error: t.shoppingLists.errorNotFound };

  const { profile } = await getProfileFamilyContext(supabase, user.id);

  const { count } = await supabase
    .from("shopping_list_items")
    .select("id", { count: "exact", head: true })
    .eq("list_id", id);

  const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
  if (error) return { error: t.shoppingLists.errorGeneric };

  const familyId = existing.family_id;
  if (familyId && profile?.account_mode === ACCOUNT_MODE.FAMILY) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatShoppingListNotificationDetail(
      existing.name,
      count ?? 0,
      t.shoppingLists
    );

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.SHOPPING_LIST_DELETED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${existing.name}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          shopping_list_id: id,
          list_name: existing.name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // Deleted; notifications are best-effort
    }
  }

  return { success: t.shoppingLists.deletedSuccess };
}

export async function toggleShoppingListWatch(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { listId, watch } = parseShoppingListWatchFromForm(formData);

  if (!listId) return { error: t.shoppingLists.errorGeneric };

  const list = await getAccessibleList(supabase, listId);
  if (!list) return { error: t.shoppingLists.errorNotFound };

  if (watch) {
    const { error } = await supabase.from("shopping_list_watches").insert({
      user_id: user.id,
      list_id: listId,
    });

    if (error) return { error: t.shoppingLists.errorGeneric };
    return { success: t.shoppingLists.watchEnabledSuccess };
  }

  const { error } = await supabase
    .from("shopping_list_watches")
    .delete()
    .eq("user_id", user.id)
    .eq("list_id", listId);

  if (error) return { error: t.shoppingLists.errorGeneric };
  return { success: t.shoppingLists.watchDisabledSuccess };
}

export async function addShoppingListItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { listId, content: contentRaw, categoryId, quantity } =
    parseShoppingItemFromForm(formData);
  const content = normalizeShoppingItemContent(contentRaw);

  if (!listId) return { error: t.shoppingLists.errorGeneric };
  if (!isValidShoppingItemContent(content)) {
    return { error: t.shoppingLists.errorItemRequired };
  }
  if (!isValidShoppingItemQuantity(quantity)) {
    return { error: t.shoppingLists.errorQuantityInvalid };
  }

  const list = await getAccessibleList(supabase, listId);
  if (!list) return { error: t.shoppingLists.errorNotFound };

  const resolvedCategoryId = await getFamilyCategoryId(
    supabase,
    categoryId,
    list.family_id
  );
  if (categoryId && !resolvedCategoryId) {
    return { error: t.shoppingLists.errorGeneric };
  }

  const { data: lastItem } = await supabase
    .from("shopping_list_items")
    .select("sort_order")
    .eq("list_id", listId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (lastItem?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("shopping_list_items").insert({
    list_id: listId,
    content,
    checked: false,
    quantity,
    category_id: resolvedCategoryId,
    sort_order: sortOrder,
    created_by: user.id,
  });

  if (error) return { error: t.shoppingLists.errorGeneric };

  await supabase
    .from("shopping_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);

  const profile = await getActorProfile(supabase, user.id);
  if (profile) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatShoppingListItemNotificationDetail(
      content,
      t.shoppingLists
    );

    try {
      await notifyWatchersAboutListItemEvent(supabase, {
        type: NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED,
        actorId: user.id,
        actorName,
        listId,
        listName: list.name,
        familyId: list.family_id,
        bodyDetail,
        itemContent: content,
      });
    } catch {
      // Saved; watcher notifications are best-effort
    }
  }

  return { success: t.shoppingLists.itemAddedSuccess };
}

export async function updateShoppingListItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { id, listId, content: contentRaw, checked, quantity } =
    parseShoppingItemUpdateFromForm(formData);

  if (!id || !listId) return { error: t.shoppingLists.errorGeneric };

  const list = await getAccessibleList(supabase, listId);
  if (!list) return { error: t.shoppingLists.errorNotFound };

  const updates: ShoppingListItemUpdate = {
    updated_at: new Date().toISOString(),
  };

  if (contentRaw !== null) {
    const content = normalizeShoppingItemContent(contentRaw);
    if (!isValidShoppingItemContent(content)) {
      return { error: t.shoppingLists.errorItemRequired };
    }
    updates.content = content;
  }

  if (checked !== null) {
    updates.checked = checked;
  }

  if (quantity !== null) {
    if (!isValidShoppingItemQuantity(quantity)) {
      return { error: t.shoppingLists.errorQuantityInvalid };
    }
    updates.quantity = quantity;
  }

  const { error } = await supabase
    .from("shopping_list_items")
    .update(updates)
    .eq("id", id)
    .eq("list_id", listId);

  if (error) return { error: t.shoppingLists.errorGeneric };

  await supabase
    .from("shopping_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);

  return { success: t.shoppingLists.itemUpdatedSuccess };
}

export async function deleteShoppingListItem(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { id, listId } = parseShoppingItemIdsFromForm(formData);

  if (!id || !listId) return { error: t.shoppingLists.errorGeneric };

  const list = await getAccessibleList(supabase, listId);
  if (!list) return { error: t.shoppingLists.errorNotFound };

  const { data: existingItem } = await supabase
    .from("shopping_list_items")
    .select("content")
    .eq("id", id)
    .eq("list_id", listId)
    .maybeSingle();

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", id)
    .eq("list_id", listId);

  if (error) return { error: t.shoppingLists.errorGeneric };

  await supabase
    .from("shopping_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);

  const itemContent = existingItem?.content ?? "";
  const profile = await getActorProfile(supabase, user.id);
  if (profile && itemContent) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatShoppingListItemNotificationDetail(
      itemContent,
      t.shoppingLists
    );

    try {
      await notifyWatchersAboutListItemEvent(supabase, {
        type: NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_REMOVED,
        actorId: user.id,
        actorName,
        listId,
        listName: list.name,
        familyId: list.family_id,
        bodyDetail,
        itemContent,
      });
    } catch {
      // Deleted; watcher notifications are best-effort
    }
  }

  return { success: t.shoppingLists.itemDeletedSuccess };
}

export async function reorderShoppingListItems(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { listId, orderedIdsRaw } = parseShoppingReorderFromForm(formData);
  const orderedIds = parseOrderedItemIds(orderedIdsRaw);

  if (!listId || !orderedIds || orderedIds.length === 0) {
    return { error: t.shoppingLists.errorGeneric };
  }

  const list = await getAccessibleList(supabase, listId);
  if (!list) return { error: t.shoppingLists.errorNotFound };

  const { data: existingItems } = await supabase
    .from("shopping_list_items")
    .select("id")
    .eq("list_id", listId);

  const existingIds = new Set((existingItems ?? []).map((item) => item.id as string));
  if (orderedIds.some((id) => !existingIds.has(id))) {
    return { error: t.shoppingLists.errorGeneric };
  }

  const now = new Date().toISOString();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("shopping_list_items")
      .update({ sort_order: index, updated_at: now })
      .eq("id", id)
      .eq("list_id", listId)
  );

  const results = await Promise.all(updates);
  if (results.some((result) => result.error)) {
    return { error: t.shoppingLists.errorGeneric };
  }

  await supabase
    .from("shopping_lists")
    .update({ updated_at: now })
    .eq("id", listId);

  return { success: t.shoppingLists.itemReorderedSuccess };
}

export async function toggleShoppingListItemChecked(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { id, listId, checked } = parseShoppingCheckedFromForm(formData);

  if (!id || !listId) return { error: t.shoppingLists.errorGeneric };

  const list = await getAccessibleList(supabase, listId);
  if (!list) return { error: t.shoppingLists.errorNotFound };

  const { error } = await supabase
    .from("shopping_list_items")
    .update({
      checked,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("list_id", listId);

  if (error) return { error: t.shoppingLists.errorGeneric };

  await supabase
    .from("shopping_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);

  return { success: t.shoppingLists.itemUpdatedSuccess };
}

export async function reorderShoppingListCategories(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();

  if (!user) return { error: t.account.errorUnauthorized };

  const { orderedIdsRaw } = parseShoppingCategoryReorderFromForm(formData);
  const orderedIds = parseOrderedCategoryIds(orderedIdsRaw);
  if (!orderedIds || orderedIds.length === 0) {
    return { error: t.shoppingLists.errorGeneric };
  }

  const { profile } = await getProfileFamilyContext(supabase, user.id);
  if (!profile?.family_id || profile.account_mode !== ACCOUNT_MODE.FAMILY) {
    return { error: t.shoppingLists.errorGeneric };
  }

  const familyId = profile.family_id;

  const { data: existing } = await supabase
    .from("shopping_list_categories")
    .select("id")
    .eq("family_id", familyId);

  const existingIds = new Set((existing ?? []).map((row) => row.id as string));
  if (orderedIds.some((id) => !existingIds.has(id))) {
    return { error: t.shoppingLists.errorGeneric };
  }

  const now = new Date().toISOString();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("shopping_list_categories")
      .update({ sort_order: index, updated_at: now })
      .eq("id", id)
      .eq("family_id", familyId)
  );

  const results = await Promise.all(updates);
  if (results.some((result) => result.error)) {
    return { error: t.shoppingLists.errorGeneric };
  }

  return { success: t.shoppingLists.categoryReorderedSuccess };
}
