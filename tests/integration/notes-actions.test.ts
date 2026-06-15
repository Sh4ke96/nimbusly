import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import { executeCreateNote } from "@/lib/notes/server/create-note";
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
    if (table === "notes") {
      return {
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: "note-1" }, error: null }),
          }),
        }),
      };
    }
    return {};
  },
};

describe("createNote server action", () => {
  it("returns unauthorized when user is missing", async () => {
    const result = await executeCreateNote(
      { t: dict.pl, user: null, supabase: soloProfileSupabase as never },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.account.errorUnauthorized);
  });

  it("requires note title", async () => {
    const result = await executeCreateNote(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      new FormData()
    );
    assert.ok(result && "error" in result);
    assert.equal(result.error, dict.pl.notes.errorTitleRequired);
  });

  it("creates note for authenticated solo user", async () => {
    const formData = new FormData();
    formData.set(NOTE_FORM_FIELD.TITLE, "Hasło WiFi");
    formData.set(NOTE_FORM_FIELD.CONTENT, "router 192.168.0.1");

    const result = await executeCreateNote(
      {
        t: dict.pl,
        user: { id: "user-1" } as never,
        supabase: soloProfileSupabase as never,
      },
      formData
    );
    assert.ok(result && "success" in result);
    assert.equal(result.success, dict.pl.notes.createdSuccess);
  });
});
