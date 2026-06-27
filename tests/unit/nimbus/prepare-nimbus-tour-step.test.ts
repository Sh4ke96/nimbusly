import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prepareNimbusTourStep } from "@/lib/nimbus/prepare-nimbus-tour-step";

describe("prepareNimbusTourStep", () => {
  it("returns null when step is undefined", async () => {
    const pushed: string[] = [];
    const result = await prepareNimbusTourStep(undefined, {
      push: (href) => {
        pushed.push(href);
      },
    });

    assert.equal(result, null);
    assert.deepEqual(pushed, []);
  });
});
