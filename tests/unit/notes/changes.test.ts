import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildNoteChangeSummary } from "@/lib/notes/changes";

const labels = {
  changeSummaryTitle: "title: {from} → {to}",
  changeSummaryCategory: "category: {from} → {to}",
  changeSummaryContent: "content changed",
  changeSummaryVisibility: "visibility changed",
  changeSummaryEmpty: "empty",
  changeSummarySeparator: "; ",
  uncategorizedLabel: "Uncategorized",
  visibilityAllFamily: "Whole family",
  visibilitySelectedMembers: "Selected members",
};

const base = {
  title: "Shopping list",
  category_id: null,
  content: "Milk",
  visible_to_member_ids: [] as string[],
};

describe("buildNoteChangeSummary", () => {
  it("reports title changes", () => {
    const summary = buildNoteChangeSummary(
      base,
      { ...base, title: "Groceries" },
      [],
      labels
    );
    assert.match(summary, /title:/);
  });

  it("returns empty summary when unchanged", () => {
    assert.equal(buildNoteChangeSummary(base, base, [], labels), "empty");
  });
});
