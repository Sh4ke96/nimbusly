import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dict } from "@/lib/i18n";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import {
  executeMarkAllNotificationsRead,
  executeMarkNotificationRead,
} from "@/lib/notifications/server/mark-notification-read";

const notificationSupabase = {
  from: () => ({
    update: () => ({
      eq: () => ({
        eq: () => ({
          is: async () => ({ error: null }),
        }),
        is: async () => ({ error: null }),
      }),
    }),
  }),
};

describe("markNotificationRead server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeMarkNotificationRead(
      { t: dict.pl, user: null, supabase: notificationSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires notification id", async () => {
    const result = await executeMarkNotificationRead(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: notificationSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.notifications.errorGeneric);
  });

  it("marks notification as read", async () => {
    const formData = new FormData();
    formData.set(COMMON_FORM_FIELD.ID, "notif-1");

    const result = await executeMarkNotificationRead(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: notificationSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.notifications.markedRead);
  });
});

describe("markAllNotificationsRead server action", () => {
  it("marks all notifications as read", async () => {
    const result = await executeMarkAllNotificationsRead({
      t: dict.pl,
      user: { id: "user-1" } as never,
      supabase: notificationSupabase as never,
    });
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.notifications.allMarkedRead);
  });
});
