import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { BUDGET_FORM_FIELD } from "@/lib/budget/types";
import { executeCreateBudget } from "@/lib/budget/server/create-budget";
import { dict } from "@/lib/i18n";

const soloProfileSupabase = {
  from: (table: string) => {
    if (table === "profiles") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: "user-1",
                account_mode: ACCOUNT_MODE.SOLO,
                family_id: null,
                first_name: "Anna",
                last_name: "Kowalska",
              },
            }),
          }),
        }),
      };
    }
    if (table === "budgets") {
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "budget-1" }, error: null }),
          }),
        }),
      };
    }
    return {};
  },
};

describe("createBudget server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreateBudget(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires budget name", async () => {
    const result = await executeCreateBudget(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.budget.errorNameRequired);
  });

  it("creates budget for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set(BUDGET_FORM_FIELD.NAME, "Domowy");

    const result = await executeCreateBudget(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.budget.createdSuccess);
  });
});
