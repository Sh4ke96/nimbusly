import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildReminderDigestHtml,
  buildReminderEmailSubject,
  formatAttentionItemsAsLines,
} from "@/lib/notifications/reminder-digest";
import { ATTENTION_KIND, getAttentionPinKey } from "@/lib/dashboard/attention";

describe("formatAttentionItemsAsLines", () => {
  it("maps labels from attention items", () => {
    const lines = formatAttentionItemsAsLines([
      {
        kind: ATTENTION_KIND.CHORE_OVERDUE,
        href: "/chores",
        label: "Overdue chore",
        pinKey: getAttentionPinKey(ATTENTION_KIND.CHORE_OVERDUE, "1"),
      },
    ]);
    assert.deepEqual(lines, ["Overdue chore"]);
  });
});

describe("buildReminderEmailSubject", () => {
  it("interpolates count in both languages", () => {
    assert.match(buildReminderEmailSubject("pl", 3), /3/);
    assert.match(buildReminderEmailSubject("en", 2), /2/);
  });
});

describe("buildReminderDigestHtml", () => {
  it("includes CTA link and reminder lines", () => {
    const html = buildReminderDigestHtml({
      lines: ["Medicine expiring"],
      lang: "en",
      siteUrl: "https://example.com",
    });
    assert.match(html, /Medicine expiring/);
    assert.match(html, /https:\/\/example\.com\/dashboard/);
  });
});
