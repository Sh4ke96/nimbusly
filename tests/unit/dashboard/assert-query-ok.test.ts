import type { PostgrestError } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import test from "node:test";
import { assertDashboardQueryOk } from "@/lib/dashboard/assert-query-ok";

const mockError = {
  message: "permission denied",
  code: "42501",
  details: "",
  hint: "",
  name: "PostgrestError",
} as PostgrestError;

test("assertDashboardQueryOk does nothing when query succeeds", () => {
  assert.doesNotThrow(() => assertDashboardQueryOk("budgets", { error: null }));
});

test("assertDashboardQueryOk throws when query fails", () => {
  assert.throws(
    () => assertDashboardQueryOk("budgets", { error: mockError }),
    /Dashboard load failed: budgets/
  );
});
