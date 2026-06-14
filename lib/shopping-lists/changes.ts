import type { ShoppingList } from "@/lib/shopping-lists/types";
import { normalizeShoppingListName } from "@/lib/shopping-lists/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type ShoppingListChangeLabels = Pick<
  Dict["shoppingLists"],
  | "changeSummaryName"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
>;

export function buildShoppingListChangeSummary(
  before: Pick<ShoppingList, "name">,
  after: Pick<ShoppingList, "name">,
  labels: ShoppingListChangeLabels
): string {
  if (
    normalizeShoppingListName(before.name) !==
    normalizeShoppingListName(after.name)
  ) {
    return formatMessage(labels.changeSummaryName, {
      from: before.name,
      to: after.name,
    });
  }

  return labels.changeSummaryEmpty;
}

export function formatShoppingListNotificationDetail(
  listName: string,
  itemCount: number,
  labels: Pick<Dict["shoppingLists"], "notificationDetailItems">
): string {
  return formatMessage(labels.notificationDetailItems, {
    name: normalizeShoppingListName(listName),
    count: String(itemCount),
  });
}

export function formatShoppingListItemNotificationDetail(
  itemContent: string,
  labels: Pick<Dict["shoppingLists"], "notificationDetailItem">
): string {
  return formatMessage(labels.notificationDetailItem, {
    item: itemContent.trim(),
  });
}
