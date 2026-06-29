import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { partitionRecipientsByChannel } from "@/lib/notifications/module-preferences/filter-recipients-by-channel";
import type { NotificationModulePreferencesMap } from "@/lib/notifications/module-preferences/types";

describe("notifyModuleSubscribers recipient filtering", () => {
  it("splits in-app and push recipients from module preferences", () => {
    const map: NotificationModulePreferencesMap = new Map([
      [
        "recipient-1",
        {
          moduleId: APP_MODULE.SHOPPING,
          inAppEnabled: true,
          pushEnabled: false,
          emailDigestEnabled: false,
        },
      ],
      [
        "recipient-2",
        {
          moduleId: APP_MODULE.SHOPPING,
          inAppEnabled: false,
          pushEnabled: true,
          emailDigestEnabled: true,
        },
      ],
    ]);

    const { inAppIds, pushIds, emailDigestIds } = partitionRecipientsByChannel(
      ["recipient-1", "recipient-2"],
      map
    );

    assert.deepEqual(inAppIds, ["recipient-1"]);
    assert.deepEqual(pushIds, ["recipient-2"]);
    assert.deepEqual(emailDigestIds, ["recipient-2"]);
    assert.equal(NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED, "shopping_list_item_added");
  });
});
