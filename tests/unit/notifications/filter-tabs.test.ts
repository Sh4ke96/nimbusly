import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  notificationFilterHref,
  parseNotificationModuleId,
} from "@/lib/notifications/filter-tabs";
import { NOTIFICATION_FILTER_TAB } from "@/lib/constants/notifications";
import { APP_MODULE } from "@/lib/constants/app-modules";

describe("parseNotificationModuleId", () => {
  it("accepts valid module ids", () => {
    assert.equal(parseNotificationModuleId(APP_MODULE.BUDGET), APP_MODULE.BUDGET);
  });

  it("rejects unknown values", () => {
    assert.equal(parseNotificationModuleId("family"), null);
    assert.equal(parseNotificationModuleId(null), null);
  });
});

describe("notificationFilterHref", () => {
  it("includes module query param when set", () => {
    assert.equal(
      notificationFilterHref(NOTIFICATION_FILTER_TAB.ALL, 1, APP_MODULE.SHOPPING),
      `/notifications?module=${APP_MODULE.SHOPPING}`
    );
  });
});
