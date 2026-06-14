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
