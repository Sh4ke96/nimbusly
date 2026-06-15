import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sortFaqIdsForPath } from "@/lib/nimbus/faq-sort";
import { NIMBUS_FAQ_ID } from "@/lib/nimbus/faq";

describe("sortFaqIdsForPath", () => {
  it("boosts budget FAQ on /budget", () => {
    const sorted = sortFaqIdsForPath(
      [NIMBUS_FAQ_ID.HIDE_NIMBUS, NIMBUS_FAQ_ID.ADD_BUDGET, NIMBUS_FAQ_ID.SHOPPING_LIST],
      "/budget"
    );
    assert.equal(sorted[0], NIMBUS_FAQ_ID.ADD_BUDGET);
  });

  it("boosts settings FAQ on profile settings", () => {
    const sorted = sortFaqIdsForPath(
      [NIMBUS_FAQ_ID.ADD_BUDGET, NIMBUS_FAQ_ID.CREATE_FAMILY],
      "/profile/settings"
    );
    assert.equal(sorted[0], NIMBUS_FAQ_ID.CREATE_FAMILY);
  });
});
