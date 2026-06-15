import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { PET_FORM_FIELD } from "@/lib/pets/types";
import { PET_SPECIES } from "@/lib/constants/pets";
import { executeCreatePet } from "@/lib/pets/server/create-pet";
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
    if (table === "pets") {
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "pet-1" }, error: null }),
          }),
        }),
      };
    }
    return {};
  },
};

describe("createPet server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreatePet(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires pet name", async () => {
    const result = await executeCreatePet(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.pets.errorNameRequired);
  });

  it("creates pet for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set(PET_FORM_FIELD.NAME, "Burek");
    formData.set(PET_FORM_FIELD.SPECIES, PET_SPECIES.DOG);

    const result = await executeCreatePet(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.pets.petCreatedSuccess);
  });
});
