import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { SHOPPING_FORM_FIELD } from "@/lib/shopping-lists/types";
import { executeCreateShoppingList } from "@/lib/shopping-lists/server/create-shopping-list";
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
    if (table === "shopping_lists") {
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "list-1" }, error: null }),
          }),
        }),
      };
    }
    return {};
  },
};

describe("createShoppingList server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreateShoppingList(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires list name", async () => {
    const result = await executeCreateShoppingList(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.shoppingLists.errorNameRequired);
  });

  it("creates list for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set(SHOPPING_FORM_FIELD.NAME, "Tygodniowe");

    const result = await executeCreateShoppingList(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.shoppingLists.createdSuccess);
  });
});
