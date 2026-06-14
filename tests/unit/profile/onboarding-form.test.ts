import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAMILY_SETUP_INTENT } from "@/lib/family/constants";
import { PROFILE_FORM_FIELD, parseOnboardingFromForm } from "@/lib/profile/form";

describe("parseOnboardingFromForm", () => {
  it("parses solo onboarding fields", () => {
    const formData = new FormData();
    formData.set(PROFILE_FORM_FIELD.FIRST_NAME, "Anna");
    formData.set(PROFILE_FORM_FIELD.LAST_NAME, "Kowalska");
    formData.set(PROFILE_FORM_FIELD.AVATAR_COLOR, "sky");
    formData.set(PROFILE_FORM_FIELD.FAMILY_INTENT, FAMILY_SETUP_INTENT.SOLO);

    const parsed = parseOnboardingFromForm(formData);
    assert.equal(parsed.firstName, "Anna");
    assert.equal(parsed.lastName, "Kowalska");
    assert.equal(parsed.avatarColor, "sky");
    assert.equal(parsed.familyIntent, FAMILY_SETUP_INTENT.SOLO);
    assert.equal(parsed.familyName, "");
    assert.equal(parsed.inviteCode, "");
  });

  it("parses family create intent with family name", () => {
    const formData = new FormData();
    formData.set(PROFILE_FORM_FIELD.FIRST_NAME, "Jan");
    formData.set(PROFILE_FORM_FIELD.LAST_NAME, "Nowak");
    formData.set(PROFILE_FORM_FIELD.AVATAR_COLOR, "rose");
    formData.set(PROFILE_FORM_FIELD.FAMILY_INTENT, FAMILY_SETUP_INTENT.CREATE);
    formData.set(PROFILE_FORM_FIELD.FAMILY_NAME, "Rodzina Nowaków");

    const parsed = parseOnboardingFromForm(formData);
    assert.equal(parsed.familyIntent, FAMILY_SETUP_INTENT.CREATE);
    assert.equal(parsed.familyName, "Rodzina Nowaków");
  });

  it("parses join intent with invite code", () => {
    const formData = new FormData();
    formData.set(PROFILE_FORM_FIELD.FAMILY_INTENT, FAMILY_SETUP_INTENT.JOIN);
    formData.set(PROFILE_FORM_FIELD.INVITE_CODE, "abcd-1234");

    const parsed = parseOnboardingFromForm(formData);
    assert.equal(parsed.familyIntent, FAMILY_SETUP_INTENT.JOIN);
    assert.equal(parsed.inviteCode, "abcd-1234");
  });
});
