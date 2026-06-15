import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { MEDICINE_AVAILABILITY, MEDICINE_FORM_TYPE } from "@/lib/constants/medicine";
import { MEDICINE_FORM_FIELD } from "@/lib/medicine/types";
import { executeCreateMedicineItem } from "@/lib/medicine/server/create-medicine-item";
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
    if (table === "medicine_items") {
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "med-1" }, error: null }),
          }),
        }),
      };
    }
    return {};
  },
};

describe("createMedicineItem server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreateMedicineItem(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires medicine name", async () => {
    const result = await executeCreateMedicineItem(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.medicineCabinet.errorNameRequired);
  });

  it("creates medicine item for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set(MEDICINE_FORM_FIELD.NAME, "Apap");
    formData.set(MEDICINE_FORM_FIELD.FORM_TYPE, MEDICINE_FORM_TYPE.TABLETS);
    formData.set(MEDICINE_FORM_FIELD.AVAILABILITY, MEDICINE_AVAILABILITY.IN_STOCK);

    const result = await executeCreateMedicineItem(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
        resolveTakenByForSave: (_takenBy, _familyId, userId) => userId,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.medicineCabinet.createdSuccess);
  });
});
