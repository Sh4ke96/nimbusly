import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getNimbusContextHintKey,
  NIMBUS_CONTEXT_PATH,
} from "@/lib/nimbus/context-hints";

describe("getNimbusContextHintKey", () => {
  it("maps known module paths to context keys", () => {
    assert.equal(getNimbusContextHintKey(NIMBUS_CONTEXT_PATH.BUDGET), "budget");
    assert.equal(getNimbusContextHintKey(NIMBUS_CONTEXT_PATH.SHOPPING), "shopping");
    assert.equal(getNimbusContextHintKey(NIMBUS_CONTEXT_PATH.NOTIFICATIONS), "notifications");
    assert.equal(getNimbusContextHintKey(NIMBUS_CONTEXT_PATH.PETS), "pets");
    assert.equal(getNimbusContextHintKey(NIMBUS_CONTEXT_PATH.FAMILY_CALENDAR), "familyCalendar");
    assert.equal(getNimbusContextHintKey(NIMBUS_CONTEXT_PATH.FAMILY), "family");
  });

  it("returns null for unknown paths", () => {
    assert.equal(getNimbusContextHintKey("/profile/settings"), null);
    assert.equal(getNimbusContextHintKey("/login"), null);
  });
});
