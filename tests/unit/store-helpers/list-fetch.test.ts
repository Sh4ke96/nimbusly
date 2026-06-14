import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listFetchInitial, runListFetch } from "@/lib/stores/list-fetch";

describe("runListFetch", () => {
  it("sets error when query fails", async () => {
    const state = { ...listFetchInitial };
    const set = (partial: Partial<typeof state>) => Object.assign(state, partial);

    await runListFetch({
      set,
      query: async () => ({ data: ["a"], error: { message: "fail" } }),
      apply: () => {},
    });

    assert.equal(state.error, true);
    assert.equal(state.loaded, true);
    assert.equal(state.loading, false);
  });

  it("coalesces null data to empty array for apply", async () => {
    const state = { ...listFetchInitial };
    const set = (partial: Partial<typeof state>) => Object.assign(state, partial);
    let applied: string[] | null = null;

    await runListFetch({
      set,
      query: async () => ({ data: null, error: null }),
      apply: (data) => {
        applied = data as string[];
      },
    });

    assert.deepEqual(applied, []);
    assert.equal(state.error, false);
    assert.equal(state.loaded, true);
  });

  it("passes through successful data", async () => {
    const state = { ...listFetchInitial };
    const set = (partial: Partial<typeof state>) => Object.assign(state, partial);
    let applied: string[] | null = null;

    await runListFetch({
      set,
      query: async () => ({ data: ["x"], error: null }),
      apply: (data) => {
        applied = data as string[];
      },
    });

    assert.deepEqual(applied, ["x"]);
    assert.equal(state.error, false);
  });
});
