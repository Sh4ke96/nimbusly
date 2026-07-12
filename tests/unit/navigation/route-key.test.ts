import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildRouteKey } from "@/lib/navigation/route-key";

describe("buildRouteKey", () => {
  it("joins pathname and search with a separator", () => {
    assert.equal(buildRouteKey("/dashboard", ""), "/dashboard?");
    assert.equal(buildRouteKey("/dashboard", "view=modules"), "/dashboard?view=modules");
    assert.equal(buildRouteKey("/shopping", "list=1"), "/shopping?list=1");
  });
});
