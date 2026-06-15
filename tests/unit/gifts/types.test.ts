import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GIFT_FILTER_ALL, GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { LANG } from "@/lib/constants/lang";
import {
  buildGiftRecipientFilterOptions,
  filterGiftIdeasByRecipient,
} from "@/lib/gifts/recipients";
import {
  getGiftRecipientFilterKey,
  isValidGiftContent,
  isValidRecipientName,
  normalizeRecipientName,
  type GiftIdea,
} from "@/lib/gifts/types";

const sampleEntries: GiftIdea[] = [
  {
    id: "1",
    family_id: "f1",
    recipient_type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
    recipient_member_id: "m1",
    recipient_name: "Anna Kowalska",
    content: "Książka kucharska",
    link_url: null,
    visible_to_member_ids: [],
    created_by: "u1",
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    family_id: "f1",
    recipient_type: GIFT_RECIPIENT_TYPE.CUSTOM,
    recipient_member_id: null,
    recipient_name: "Ciocia Zosia",
    content: "Kwiaty",
    link_url: null,
    visible_to_member_ids: [],
    created_by: "u1",
    created_at: "",
    updated_at: "",
  },
];

describe("normalizeRecipientName", () => {
  it("trims and collapses whitespace", () => {
    assert.equal(normalizeRecipientName("  Anna   Kowalska  "), "Anna Kowalska");
  });
});

describe("isValidRecipientName", () => {
  it("rejects empty names", () => {
    assert.equal(isValidRecipientName("   "), false);
    assert.equal(isValidRecipientName("Jan"), true);
  });
});

describe("isValidGiftContent", () => {
  it("requires non-empty content within limit", () => {
    assert.equal(isValidGiftContent("Pomysł"), true);
    assert.equal(isValidGiftContent("   "), false);
  });
});

describe("getGiftRecipientFilterKey", () => {
  it("builds member and custom keys", () => {
    assert.equal(getGiftRecipientFilterKey(sampleEntries[0]), "member:m1");
    assert.equal(getGiftRecipientFilterKey(sampleEntries[1]), "custom:ciocia zosia");
  });
});

describe("buildGiftRecipientFilterOptions", () => {
  it("includes all option and unique recipients", () => {
    const options = buildGiftRecipientFilterOptions(sampleEntries, [], "Wszyscy", LANG.PL);
    assert.equal(options[0]?.key, GIFT_FILTER_ALL);
    assert.equal(options.length, 3);
  });
});

describe("filterGiftIdeasByRecipient", () => {
  it("filters by recipient key", () => {
    const filtered = filterGiftIdeasByRecipient(sampleEntries, "member:m1");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, "1");
  });
});
