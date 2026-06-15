import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { CHORE_RECURRENCE, CHORE_STATUS } from "@/lib/constants/chores";
import { executeCreateChoreTask } from "@/lib/chores/server/create-chore-task";
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
    if (table === "chore_tasks") {
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "chore-1" }, error: null }),
          }),
        }),
      };
    }
    return {};
  },
};

describe("createChoreTask server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreateChoreTask(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires chore title", async () => {
    const result = await executeCreateChoreTask(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.chores.errorTitleRequired);
  });

  it("creates chore for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set(CHORE_FORM_FIELD.TITLE, "Odkurzanie");
    formData.set(CHORE_FORM_FIELD.STATUS, CHORE_STATUS.PENDING);
    formData.set(CHORE_FORM_FIELD.RECURRENCE, CHORE_RECURRENCE.NONE);

    const result = await executeCreateChoreTask(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.chores.createdSuccess);
  });
});
