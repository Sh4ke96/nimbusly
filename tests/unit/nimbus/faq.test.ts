import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NIMBUS_FAQ_HREF,
  NIMBUS_FAQ_ID,
  NIMBUS_FAQ_IDS,
  NIMBUS_FAQ_MODULE_LABEL_KEY,
} from "@/lib/nimbus/faq";

describe("nimbus faq", () => {
  it("lists every faq id with href and module label key", () => {
    for (const id of NIMBUS_FAQ_IDS) {
      assert.ok(NIMBUS_FAQ_HREF[id], `missing href for ${id}`);
      assert.ok(NIMBUS_FAQ_MODULE_LABEL_KEY[id], `missing module label for ${id}`);
    }
  });

  it("links join family faq to account tab", () => {
    assert.equal(
      NIMBUS_FAQ_HREF[NIMBUS_FAQ_ID.JOIN_FAMILY],
      "/profile/settings?tab=account#join-family"
    );
    assert.equal(NIMBUS_FAQ_HREF[NIMBUS_FAQ_ID.LEAVE_FAMILY], "/profile/settings?tab=family");
  });

  it("links notifications and search faq to relevant routes", () => {
    assert.equal(NIMBUS_FAQ_HREF[NIMBUS_FAQ_ID.NOTIFICATIONS], "/notifications");
    assert.equal(NIMBUS_FAQ_HREF[NIMBUS_FAQ_ID.GLOBAL_SEARCH], "/dashboard");
  });
});
