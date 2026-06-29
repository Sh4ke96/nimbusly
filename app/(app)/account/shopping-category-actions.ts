"use server";

import { getServerT } from "@/lib/i18n/server";
import { FAMILY_ACCESS_ERROR, type FamilyAccessError } from "@/lib/constants/server-error";
import {
  requireShoppingCategoryManager,
  SHOPPING_CATEGORY_SCOPE,
} from "@/lib/family/server/require-shopping-category-manager";
import {
  isValidShoppingCategoryName,
  normalizeShoppingCategoryName,
  parseOrderedCategoryIds,
  parseShoppingCategoryIdFromForm,
  parseShoppingCategoryNameFromForm,
  parseShoppingCategoryReorderFromForm,
} from "@/lib/shopping-lists/categories";
import type { AccountActionState } from "@/app/(app)/account/actions";

function mapManagerError(error: FamilyAccessError, t: Awaited<ReturnType<typeof getServerT>>) {
  if (error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) {
    return t.account.errorUnauthorized;
  }
  if (error === FAMILY_ACCESS_ERROR.NO_FAMILY) {
    return t.shoppingCategories.errorNoFamily;
  }
  return t.shoppingCategories.errorNotFounder;
}

async function listCategoryIds(
  access: Awaited<ReturnType<typeof requireShoppingCategoryManager>>
): Promise<Set<string>> {
  if ("error" in access) return new Set();

  if (access.scope === SHOPPING_CATEGORY_SCOPE.SOLO) {
    const { data } = await access.supabase
      .from("shopping_list_categories")
      .select("id")
      .is("family_id", null)
      .eq("created_by", access.user.id);
    return new Set((data ?? []).map((row) => row.id as string));
  }

  const { data } = await access.supabase
    .from("shopping_list_categories")
    .select("id")
    .eq("family_id", access.family.id);
  return new Set((data ?? []).map((row) => row.id as string));
}

export async function createShoppingListCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireShoppingCategoryManager();
  if ("error" in access) {
    return { error: mapManagerError(access.error, t) };
  }

  const name = normalizeShoppingCategoryName(
    parseShoppingCategoryNameFromForm(formData).name
  );

  if (!isValidShoppingCategoryName(name)) {
    return { error: t.shoppingCategories.errorNameRequired };
  }

  const scopeFilter =
    access.scope === SHOPPING_CATEGORY_SCOPE.SOLO
      ? access.supabase
          .from("shopping_list_categories")
          .select("sort_order")
          .is("family_id", null)
          .eq("created_by", access.user.id)
      : access.supabase
          .from("shopping_list_categories")
          .select("sort_order")
          .eq("family_id", access.family.id);

  const { data: lastCategory } = await scopeFilter
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (lastCategory?.sort_order ?? -1) + 1;
  const now = new Date().toISOString();

  const { error } = await access.supabase.from("shopping_list_categories").insert({
    family_id: access.scope === SHOPPING_CATEGORY_SCOPE.FAMILY ? access.family.id : null,
    created_by: access.user.id,
    name,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  });

  if (error) return { error: t.shoppingCategories.errorGeneric };
  return { success: t.shoppingCategories.createdSuccess };
}

export async function updateShoppingListCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireShoppingCategoryManager();
  if ("error" in access) {
    return { error: mapManagerError(access.error, t) };
  }

  const id = parseShoppingCategoryIdFromForm(formData);
  const name = normalizeShoppingCategoryName(
    parseShoppingCategoryNameFromForm(formData).name
  );

  if (!id) return { error: t.shoppingCategories.errorGeneric };
  if (!isValidShoppingCategoryName(name)) {
    return { error: t.shoppingCategories.errorNameRequired };
  }

  const query = access.supabase
    .from("shopping_list_categories")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id);

  const { error } =
    access.scope === SHOPPING_CATEGORY_SCOPE.SOLO
      ? await query.is("family_id", null).eq("created_by", access.user.id)
      : await query.eq("family_id", access.family.id);

  if (error) return { error: t.shoppingCategories.errorGeneric };
  return { success: t.shoppingCategories.updatedSuccess };
}

export async function deleteShoppingListCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireShoppingCategoryManager();
  if ("error" in access) {
    return { error: mapManagerError(access.error, t) };
  }

  const id = parseShoppingCategoryIdFromForm(formData);
  if (!id) return { error: t.shoppingCategories.errorGeneric };

  const query = access.supabase.from("shopping_list_categories").delete().eq("id", id);

  const { error } =
    access.scope === SHOPPING_CATEGORY_SCOPE.SOLO
      ? await query.is("family_id", null).eq("created_by", access.user.id)
      : await query.eq("family_id", access.family.id);

  if (error) return { error: t.shoppingCategories.errorGeneric };
  return { success: t.shoppingCategories.deletedSuccess };
}

export async function reorderShoppingListCategories(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireShoppingCategoryManager();
  if ("error" in access) {
    return { error: mapManagerError(access.error, t) };
  }

  const { orderedIdsRaw } = parseShoppingCategoryReorderFromForm(formData);
  const orderedIds = parseOrderedCategoryIds(orderedIdsRaw);

  if (!orderedIds || orderedIds.length === 0) {
    return { error: t.shoppingCategories.errorGeneric };
  }

  const existingIds = await listCategoryIds(access);
  if (orderedIds.some((id) => !existingIds.has(id))) {
    return { error: t.shoppingCategories.errorGeneric };
  }

  const now = new Date().toISOString();
  const updates = orderedIds.map((id, index) => {
    const query = access.supabase
      .from("shopping_list_categories")
      .update({ sort_order: index, updated_at: now })
      .eq("id", id);

    return access.scope === SHOPPING_CATEGORY_SCOPE.SOLO
      ? query.is("family_id", null).eq("created_by", access.user.id)
      : query.eq("family_id", access.family!.id);
  });

  const results = await Promise.all(updates);
  if (results.some((result) => result.error)) {
    return { error: t.shoppingCategories.errorGeneric };
  }

  return { success: t.shoppingCategories.reorderedSuccess };
}
