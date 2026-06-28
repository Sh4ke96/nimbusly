import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { NOTIFICATION_DEEP_LINK_QUERY } from "@/lib/constants/notification-deep-links";
import { PUSH_NOTIFICATION_DEFAULT_URL } from "@/lib/constants/push";
import { resolvePushNotificationUrl } from "@/lib/notifications/push-url";

describe("resolvePushNotificationUrl", () => {
  it("links shopping list item alerts to the list in /shopping", () => {
    const url = resolvePushNotificationUrl(NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED, {
      shopping_list_id: "list-abc",
    });

    assert.equal(
      url,
      `/shopping?${NOTIFICATION_DEEP_LINK_QUERY.SHOPPING_LIST}=${encodeURIComponent("list-abc")}`
    );
  });

  it("links budget expense alerts to the budget in /budget", () => {
    const url = resolvePushNotificationUrl(NOTIFICATION_TYPE.BUDGET_EXPENSE_ADDED, {
      budget_id: "budget-xyz",
    });

    assert.equal(
      url,
      `/budget?${NOTIFICATION_DEEP_LINK_QUERY.BUDGET}=${encodeURIComponent("budget-xyz")}`
    );
  });

  it("falls back to /notifications for unrelated types", () => {
    const url = resolvePushNotificationUrl(NOTIFICATION_TYPE.GIFT_ADDED, {
      gift_id: "gift-1",
    });

    assert.equal(url, PUSH_NOTIFICATION_DEFAULT_URL);
  });
});
