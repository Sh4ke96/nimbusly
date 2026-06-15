"use server";

import { getServerT } from "@/lib/i18n/server";
import { requireFamilyFounder } from "@/lib/family/server/require-family-founder";
import { FAMILY_ACCESS_ERROR, type FamilyAccessError } from "@/lib/constants/server-error";
import {
  isValidShoppingCategoryName,
  normalizeShoppingCategoryName,
  parseOrderedCategoryIds,
  parseShoppingCategoryIdFromForm,
  parseShoppingCategoryNameFromForm,
  parseShoppingCategoryReorderFromForm,
} from "@/lib/shopping-lists/categories";
import type { AccountActionState } from "@/app/(app)/account/actions";

function mapFounderError(error: FamilyAccessError, t: Awaited<ReturnType<typeof getServerT>>) {
  if (error === FAMILY_ACCESS_ERROR.UNAUTHORIZED) {
    return t.account.errorUnauthorized;
  }
  if (error === FAMILY_ACCESS_ERROR.NO_FAMILY) {
    return t.shoppingCategories.errorNoFamily;
  }
  return t.shoppingCategories.errorNotFounder;
}

export async function createShoppingListCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireFamilyFounder();
  if ("error" in access) {
    return { error: mapFounderError(access.error, t) };
  }

  const { supabase, family } = access;
  const name = normalizeShoppingCategoryName(
    parseShoppingCategoryNameFromForm(formData).name
  );

  if (!isValidShoppingCategoryName(name)) {
    return { error: t.shoppingCategories.errorNameRequired };
  }

  const { data: lastCategory } = await supabase
    .from("shopping_list_categories")
    .select("sort_order")
    .eq("family_id", family.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (lastCategory?.sort_order ?? -1) + 1;
  const now = new Date().toISOString();

  const { error } = await supabase.from("shopping_list_categories").insert({
    family_id: family.id,
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
  const access = await requireFamilyFounder();
  if ("error" in access) {
    return { error: mapFounderError(access.error, t) };
  }

  const { supabase, family } = access;
  const id = parseShoppingCategoryIdFromForm(formData);
  const name = normalizeShoppingCategoryName(
    parseShoppingCategoryNameFromForm(formData).name
  );

  if (!id) return { error: t.shoppingCategories.errorGeneric };
  if (!isValidShoppingCategoryName(name)) {
    return { error: t.shoppingCategories.errorNameRequired };
  }

  const { error } = await supabase
    .from("shopping_list_categories")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("family_id", family.id);

  if (error) return { error: t.shoppingCategories.errorGeneric };
  return { success: t.shoppingCategories.updatedSuccess };
}

export async function deleteShoppingListCategory(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireFamilyFounder();
  if ("error" in access) {
    return { error: mapFounderError(access.error, t) };
  }

  const { supabase, family } = access;
  const id = parseShoppingCategoryIdFromForm(formData);
  if (!id) return { error: t.shoppingCategories.errorGeneric };

  const { error } = await supabase
    .from("shopping_list_categories")
    .delete()
    .eq("id", id)
    .eq("family_id", family.id);

  if (error) return { error: t.shoppingCategories.errorGeneric };
  return { success: t.shoppingCategories.deletedSuccess };
}

export async function reorderShoppingListCategories(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const access = await requireFamilyFounder();
  if ("error" in access) {
    return { error: mapFounderError(access.error, t) };
  }

  const { supabase, family } = access;
  const { orderedIdsRaw } = parseShoppingCategoryReorderFromForm(formData);
  const orderedIds = parseOrderedCategoryIds(orderedIdsRaw);

  if (!orderedIds || orderedIds.length === 0) {
    return { error: t.shoppingCategories.errorGeneric };
  }

  const { data: existing } = await supabase
    .from("shopping_list_categories")
    .select("id")
    .eq("family_id", family.id);

  const existingIds = new Set((existing ?? []).map((row) => row.id as string));
  if (orderedIds.some((id) => !existingIds.has(id))) {
    return { error: t.shoppingCategories.errorGeneric };
  }

  const now = new Date().toISOString();
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("shopping_list_categories")
      .update({ sort_order: index, updated_at: now })
      .eq("id", id)
      .eq("family_id", family.id)
  );

  const results = await Promise.all(updates);
  if (results.some((result) => result.error)) {
    return { error: t.shoppingCategories.errorGeneric };
  }

  return { success: t.shoppingCategories.reorderedSuccess };
}
