import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBirthdayFromForm, parseBirthdayIdFromForm } from "@/lib/birthdays/types";
import { BIRTHDAY_FORM_FIELD } from "@/lib/birthdays/types";
import { parseEntityIdFromForm } from "@/lib/form/common-fields";
import {
  getFormBooleanTrue,
  getFormNumber,
  getFormTrimmedString,
} from "@/lib/form/values";
import { parseGiftContentFromForm } from "@/lib/gifts/types";
import { parseShoppingItemUpdateFromForm } from "@/lib/shopping-lists/types";
import { parseSignInFromForm } from "@/lib/auth/form";
import { parseProfileNamesFromForm, parseOnboardingFromForm } from "@/lib/profile/form";
import { parseFamilyInviteEmailFromForm } from "@/lib/family/form";
import { excludeActorFromWatcherIds } from "@/lib/notifications/watches";
import { FAMILY_SETUP_INTENT } from "@/lib/family/constants";
import { PROFILE_FORM_FIELD } from "@/lib/profile/form";

describe("form value helpers", () => {
  it("reads trimmed strings and booleans", () => {
    const formData = new FormData();
    formData.set("name", "  Anna  ");
    formData.set("watch", "true");
    formData.set("checked", "false");

    assert.equal(getFormTrimmedString(formData, "name"), "Anna");
    assert.equal(getFormBooleanTrue(formData, "watch"), true);
    assert.equal(getFormBooleanTrue(formData, "checked"), false);
    assert.equal(getFormNumber(formData, "missing"), 0);
  });
});

describe("parseEntityIdFromForm", () => {
  it("returns trimmed id", () => {
    const formData = new FormData();
    formData.set("id", "  abc-123  ");
    assert.equal(parseEntityIdFromForm(formData), "abc-123");
  });
});

describe("parseBirthdayFromForm", () => {
  it("parses birthday fields", () => {
    const formData = new FormData();
    formData.set(BIRTHDAY_FORM_FIELD.PERSON_NAME, "  Jan  ");
    formData.set(BIRTHDAY_FORM_FIELD.BIRTH_MONTH, "6");
    formData.set(BIRTHDAY_FORM_FIELD.BIRTH_DAY, "14");
    formData.set(BIRTHDAY_FORM_FIELD.DESCRIPTION, " notatka ");

    const parsed = parseBirthdayFromForm(formData);
    assert.equal(parsed.personName, "Jan");
    assert.equal(parsed.birthMonth, 6);
    assert.equal(parsed.birthDay, 14);
    assert.equal(parsed.description, "notatka");
    assert.equal(parseBirthdayIdFromForm(formData), "");
  });
});

describe("parseGiftContentFromForm", () => {
  it("trims gift content", () => {
    const formData = new FormData();
    formData.set("content", "  Książka  ");
    assert.equal(parseGiftContentFromForm(formData).content, "Książka");
  });
});

describe("parseShoppingItemUpdateFromForm", () => {
  it("distinguishes absent and present optional fields", () => {
    const formData = new FormData();
    formData.set("id", "item-1");
    formData.set("listId", "list-1");
    formData.set("checked", "true");

    const parsed = parseShoppingItemUpdateFromForm(formData);
    assert.equal(parsed.id, "item-1");
    assert.equal(parsed.listId, "list-1");
    assert.equal(parsed.content, null);
    assert.equal(parsed.checked, true);
  });
});

describe("parseSignInFromForm", () => {
  it("reads email and password", () => {
    const formData = new FormData();
    formData.set("email", "a@b.c");
    formData.set("password", "secret");
    assert.deepEqual(parseSignInFromForm(formData), {
      email: "a@b.c",
      password: "secret",
    });
  });
});

describe("parseProfileNamesFromForm", () => {
  it("trims profile names", () => {
    const formData = new FormData();
    formData.set(PROFILE_FORM_FIELD.FIRST_NAME, "  Jan  ");
    formData.set(PROFILE_FORM_FIELD.LAST_NAME, " Kowalski ");
    formData.set(PROFILE_FORM_FIELD.AVATAR_COLOR, "blue");
    const parsed = parseProfileNamesFromForm(formData);
    assert.equal(parsed.firstName, "Jan");
    assert.equal(parsed.lastName, "Kowalski");
    assert.equal(parsed.avatarColor, "blue");
  });
});

describe("parseOnboardingFromForm", () => {
  it("parses onboarding fields", () => {
    const formData = new FormData();
    formData.set(PROFILE_FORM_FIELD.FAMILY_INTENT, FAMILY_SETUP_INTENT.SOLO);
    formData.set(PROFILE_FORM_FIELD.INVITE_CODE, "  abcd  ");
    const parsed = parseOnboardingFromForm(formData);
    assert.equal(parsed.familyIntent, FAMILY_SETUP_INTENT.SOLO);
    assert.equal(parsed.inviteCode, "abcd");
  });
});

describe("parseFamilyInviteEmailFromForm", () => {
  it("lowercases invite email", () => {
    const formData = new FormData();
    formData.set("email", "  Anna@Example.COM ");
    assert.equal(parseFamilyInviteEmailFromForm(formData).email, "anna@example.com");
  });
});

describe("excludeActorFromWatcherIds", () => {
  it("removes actor from watcher list", () => {
    assert.deepEqual(excludeActorFromWatcherIds(["a", "b", "c"], "b"), ["a", "c"]);
  });
});
