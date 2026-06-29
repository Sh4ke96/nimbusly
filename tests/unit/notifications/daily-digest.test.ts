import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { ATTENTION_KIND } from "@/lib/dashboard/attention";
import { defaultModulePreference } from "@/lib/notifications/module-preferences/defaults";
import {
  filterAttentionItemsForDigest,
  groupNotificationsForDigest,
} from "@/lib/notifications/daily-digest/build-daily-digest";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";

describe("daily digest", () => {
  it("filters attention items by email digest module prefs", () => {
    const preferences = [
      { ...defaultModulePreference(APP_MODULE.BIRTHDAYS), emailDigestEnabled: true },
      { ...defaultModulePreference(APP_MODULE.CHORES), emailDigestEnabled: false },
    ];

    const filtered = filterAttentionItemsForDigest(
      [
        {
          kind: ATTENTION_KIND.BIRTHDAY_SOON,
          href: "/birthdays",
          label: "Birthday",
          pinKey: "birthday:1",
        },
        {
          kind: ATTENTION_KIND.CHORE_OVERDUE,
          href: "/chores",
          label: "Chore",
          pinKey: "chore:1",
        },
      ],
      preferences
    );

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.kind, ATTENTION_KIND.BIRTHDAY_SOON);
  });

  it("groups recent notifications by enabled modules", () => {
    const preferences = [
      { ...defaultModulePreference(APP_MODULE.SHOPPING), emailDigestEnabled: true },
      { ...defaultModulePreference(APP_MODULE.BUDGET), emailDigestEnabled: false },
    ];

    const sections = groupNotificationsForDigest(
      [
        {
          id: "1",
          user_id: "u1",
          type: NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED,
          title: "List update",
          body: "Milk",
          payload: {},
          read_at: null,
          created_at: new Date().toISOString(),
        },
      ],
      preferences
    );

    assert.equal(sections.length, 1);
    assert.equal(sections[0]?.moduleId, APP_MODULE.SHOPPING);
    assert.equal(sections[0]?.lines.length, 1);
  });
});
