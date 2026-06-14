import { formatShoppingListNotificationDetail } from "@/lib/shopping-lists/changes";
import {
  isValidShoppingListName,
  normalizeShoppingListName,
  parseShoppingListNameFromForm,
} from "@/lib/shopping-lists/types";
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
  }
) => Promise<void>;

export type CreateShoppingListContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  notifyFamilyMembers?: NotifyFamilyMembers;
};

export async function executeCreateShoppingList(
  { t, user, supabase, notifyFamilyMembers }: CreateShoppingListContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const name = normalizeShoppingListName(parseShoppingListNameFromForm(formData).name);
  if (!isValidShoppingListName(name)) {
    return { error: t.shoppingLists.errorNameRequired };
  }

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);

  const { data: list, error } = await supabase
    .from("shopping_lists")
    .insert({
      family_id: familyId,
      name,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !list) return { error: t.shoppingLists.errorGeneric };

  if (familyId && profile && notifyFamilyMembers) {
    const actorName = getDisplayName(profile);
    const bodyDetail = formatShoppingListNotificationDetail(name, 0, t.shoppingLists);

    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.SHOPPING_LIST_ADDED,
        actorId: user.id,
        actorName,
        familyId,
        body: `${name}${t.notifications.notificationBodySeparator}${bodyDetail}`,
        payload: {
          shopping_list_id: list.id,
          list_name: name,
          actor_id: user.id,
          family_id: familyId,
          change_summary: null,
          updated_at: new Date().toISOString(),
        },
      });
    } catch {
      // best-effort
    }
  }

  return { success: t.shoppingLists.createdSuccess };
}
