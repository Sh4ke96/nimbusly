import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterNotesByCategory,
  isValidNoteCategoryName,
  isValidNoteTitle,
  NOTE_FILTER_ALL,
  NOTE_FILTER_UNCATEGORIZED,
  resolveNoteCategoryLabel,
  type Note,
} from "@/lib/notes/types";

const note = (overrides: Partial<Note> = {}): Note => ({
  id: "1",
  family_id: null,
  category_id: null,
  title: "Test",
  content: "",
  visible_to_member_ids: [],
  created_by: "u1",
  created_at: "",
  updated_at: "",
  ...overrides,
});

describe("isValidNoteTitle", () => {
  it("requires non-empty trimmed title", () => {
    assert.equal(isValidNoteTitle("  Hello "), true);
    assert.equal(isValidNoteTitle("   "), false);
  });
});

describe("isValidNoteCategoryName", () => {
  it("requires non-empty name", () => {
    assert.equal(isValidNoteCategoryName("Dom"), true);
    assert.equal(isValidNoteCategoryName(""), false);
  });
});

describe("filterNotesByCategory", () => {
  const notes = [
    note({ id: "1", category_id: "cat-a" }),
    note({ id: "2", category_id: null }),
  ];

  it("returns all notes for filter all", () => {
    assert.equal(filterNotesByCategory(notes, NOTE_FILTER_ALL).length, 2);
  });

  it("filters uncategorized notes", () => {
    assert.equal(filterNotesByCategory(notes, NOTE_FILTER_UNCATEGORIZED).length, 1);
  });

  it("filters by category id", () => {
    assert.equal(filterNotesByCategory(notes, "cat-a").length, 1);
  });
});

describe("resolveNoteCategoryLabel", () => {
  it("includes emoji when present", () => {
    const label = resolveNoteCategoryLabel(
      "cat-a",
      [{ id: "cat-a", family_id: null, name: "Dom", icon_emoji: "🏠", sort_order: 0, created_by: "u1", created_at: "", updated_at: "" }],
      "Bez kategorii"
    );
    assert.equal(label, "🏠 Dom");
  });
});
