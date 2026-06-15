import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildGiftChangeSummary } from "@/lib/gifts/changes";

const labels = {
  changeSummaryRecipient: "recipient: {from} → {to}",
  changeSummaryContent: "content changed",
  changeSummaryLink: "link changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
};

const base = {
  recipient_name: "Anna",
  content: "Book",
  link_url: null,
};

describe("buildGiftChangeSummary", () => {
  it("reports recipient changes", () => {
    const summary = buildGiftChangeSummary(
      base,
      { ...base, recipient_name: "Bartek" },
      labels
    );
    assert.match(summary, /recipient:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildGiftChangeSummary(base, base, labels), "empty");
  });
});
