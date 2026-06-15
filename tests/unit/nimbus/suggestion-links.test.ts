import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NIMBUS_SUGGESTION_HREF } from "@/lib/nimbus/suggestion-links";
import { NIMBUS_SUGGESTION_ID } from "@/lib/nimbus/suggestions";

describe("NIMBUS_SUGGESTION_HREF", () => {
  it("covers every suggestion id", () => {
    for (const id of Object.values(NIMBUS_SUGGESTION_ID)) {
      assert.ok(NIMBUS_SUGGESTION_HREF[id], `missing href for ${id}`);
      assert.ok(NIMBUS_SUGGESTION_HREF[id].startsWith("/"));
    }
  });
});
