import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dict } from "@/lib/i18n";
import { executeCreateBirthday } from "@/lib/birthdays/server/create-birthday";

const soloProfileSupabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: {
            account_mode: "solo",
            family_id: null,
            first_name: "Anna",
            last_name: "Kowalska",
          },
        }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: { id: "birthday-1" }, error: null }),
      }),
    }),
  }),
};

describe("createBirthday server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreateBirthday(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires person name", async () => {
    const formData = new FormData();
    formData.set("birthMonth", "5");
    formData.set("birthDay", "10");

    const result = await executeCreateBirthday(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.birthdays.errorPersonName);
  });

  it("creates entry for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set("personName", "Mama");
    formData.set("birthMonth", "5");
    formData.set("birthDay", "10");

    const result = await executeCreateBirthday(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.birthdays.createdSuccess);
  });
});
