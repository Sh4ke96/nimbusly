import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTotalPages, getVisiblePageNumbers } from "@/lib/notifications/pagination";
import { parseNotificationFilterTab } from "@/lib/notifications/filter-tabs";
import { NOTIFICATION_FILTER_TAB, NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getNotificationModuleIcon } from "@/lib/notifications/module-icon";
import { Cake, CalendarDays, Gift, ShoppingCart, Wallet } from "lucide-react";

describe("getTotalPages", () => {
  it("returns at least one page", () => {
    assert.equal(getTotalPages(0, 10), 1);
    assert.equal(getTotalPages(10, 10), 1);
    assert.equal(getTotalPages(11, 10), 2);
  });
});

describe("getVisiblePageNumbers", () => {
  it("returns all pages when total is small", () => {
    assert.deepEqual(getVisiblePageNumbers(1, 3), [1, 2, 3]);
  });

  it("includes ellipsis for large totals", () => {
    const pages = getVisiblePageNumbers(5, 10);
    assert.equal(pages[0], 1);
    assert.equal(pages.at(-1), 10);
    assert.ok(pages.includes("ellipsis"));
  });
});

describe("parseNotificationFilterTab", () => {
  it("parses known filters", () => {
    assert.equal(parseNotificationFilterTab("unread"), NOTIFICATION_FILTER_TAB.UNREAD);
    assert.equal(parseNotificationFilterTab("read"), NOTIFICATION_FILTER_TAB.READ);
    assert.equal(parseNotificationFilterTab(null), NOTIFICATION_FILTER_TAB.ALL);
  });
});

describe("getNotificationModuleIcon", () => {
  it("maps notification types to module icons", () => {
    assert.equal(getNotificationModuleIcon(NOTIFICATION_TYPE.BIRTHDAY_ADDED), Cake);
    assert.equal(getNotificationModuleIcon(NOTIFICATION_TYPE.SCHEDULE_UPDATED), CalendarDays);
    assert.equal(getNotificationModuleIcon(NOTIFICATION_TYPE.GIFT_ADDED), Gift);
    assert.equal(
      getNotificationModuleIcon(NOTIFICATION_TYPE.SHOPPING_LIST_ADDED),
      ShoppingCart
    );
    assert.equal(getNotificationModuleIcon(NOTIFICATION_TYPE.BUDGET_ADDED), Wallet);
  });
});
