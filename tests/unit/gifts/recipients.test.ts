import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GIFT_FILTER_ALL, GIFT_RECIPIENT_TYPE } from "@/lib/constants/gifts";
import { LANG } from "@/lib/constants/lang";
import {
  buildGiftRecipientFilterOptions,
  filterGiftIdeasByRecipient,
  resolveGiftRecipientLabel,
} from "@/lib/gifts/recipients";
import type { GiftIdea } from "@/lib/gifts/types";
import type { FamilyMember } from "@/lib/profile";

function gift(partial: Partial<GiftIdea>): GiftIdea {
  return {
    id: "1",
    family_id: null,
    recipient_type: GIFT_RECIPIENT_TYPE.CUSTOM,
    recipient_member_id: null,
    recipient_name: "Ciocia",
    content: "Książka",
    created_by: "u1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...partial,
  };
}

const members: FamilyMember[] = [
  {
    id: "m1",
    first_name: "Anna",
    last_name: "Kowalska",
    avatar_color: "#618764",
    family_role: "admin",
  },
];

describe("resolveGiftRecipientLabel", () => {
  it("uses member name when linked", () => {
    const label = resolveGiftRecipientLabel(
      { recipient_member_id: "m1", recipient_name: "" },
      members
    );
    assert.equal(label, "Anna Kowalska");
  });
});

describe("filterGiftIdeasByRecipient", () => {
  it("filters by recipient key", () => {
    const entries = [
      gift({
        id: "1",
        recipient_type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
        recipient_member_id: "m1",
        recipient_name: "",
      }),
      gift({ id: "2", recipient_name: "Ciocia" }),
    ];
    assert.equal(filterGiftIdeasByRecipient(entries, GIFT_FILTER_ALL).length, 2);
    assert.equal(filterGiftIdeasByRecipient(entries, "member:m1").length, 1);
  });
});

describe("buildGiftRecipientFilterOptions", () => {
  it("builds unique recipient options", () => {
    const options = buildGiftRecipientFilterOptions(
      [
        gift({
          id: "1",
          recipient_type: GIFT_RECIPIENT_TYPE.FAMILY_MEMBER,
          recipient_member_id: "m1",
          recipient_name: "",
        }),
        gift({ id: "2", recipient_name: "Ciocia" }),
      ],
      members,
      "Wszyscy",
      LANG.PL
    );
    assert.equal(options[0].key, GIFT_FILTER_ALL);
    assert.equal(options.length, 3);
  });
});
