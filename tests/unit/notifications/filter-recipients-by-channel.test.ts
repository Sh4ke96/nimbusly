import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NOTIFICATION_CHANNEL } from "@/lib/constants/notification-channels";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { defaultModulePreference } from "@/lib/notifications/module-preferences/defaults";
import {
  filterRecipientIdsByChannel,
  partitionRecipientsByChannel,
} from "@/lib/notifications/module-preferences/filter-recipients-by-channel";
import type { NotificationModulePreferencesMap } from "@/lib/notifications/module-preferences/types";

describe("filterRecipientsByChannel", () => {
  it("returns only users with in-app enabled", () => {
    const map: NotificationModulePreferencesMap = new Map([
      [
        "user-a",
        {
          ...defaultModulePreference(APP_MODULE.SHOPPING),
          inAppEnabled: true,
          pushEnabled: false,
        },
      ],
      [
        "user-b",
        {
          ...defaultModulePreference(APP_MODULE.SHOPPING),
          inAppEnabled: false,
          pushEnabled: true,
        },
      ],
    ]);

    const inApp = filterRecipientIdsByChannel(
      ["user-a", "user-b"],
      map,
      NOTIFICATION_CHANNEL.IN_APP
    );
    const push = filterRecipientIdsByChannel(
      ["user-a", "user-b"],
      map,
      NOTIFICATION_CHANNEL.PUSH
    );

    assert.deepEqual(inApp, ["user-a"]);
    assert.deepEqual(push, ["user-b"]);
  });

  it("partitions recipients by channel", () => {
    const map: NotificationModulePreferencesMap = new Map([
      [
        "user-a",
        {
          moduleId: APP_MODULE.BUDGET,
          inAppEnabled: true,
          pushEnabled: true,
          emailDigestEnabled: false,
        },
      ],
    ]);

    const parts = partitionRecipientsByChannel(["user-a"], map);
    assert.deepEqual(parts.inAppIds, ["user-a"]);
    assert.deepEqual(parts.pushIds, ["user-a"]);
    assert.deepEqual(parts.emailDigestIds, []);
  });
});
