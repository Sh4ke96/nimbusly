import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACCOUNT_MODE, FAMILY_ROLE } from "@/lib/constants/account";
import { canManageShoppingCategories, isFamilyAdmin } from "@/lib/profile/family-roles";

describe("isFamilyAdmin", () => {
  const family = { created_by: "founder-1" };

  it("treats founders and admins as admins", () => {
    assert.equal(
      isFamilyAdmin(
        { family_role: FAMILY_ROLE.MEMBER },
        family,
        "founder-1"
      ),
      true
    );
    assert.equal(
      isFamilyAdmin(
        { family_role: FAMILY_ROLE.ADMIN },
        family,
        "admin-1"
      ),
      true
    );
  });

  it("denies regular members", () => {
    assert.equal(
      isFamilyAdmin(
        { family_role: FAMILY_ROLE.MEMBER },
        family,
        "member-1"
      ),
      false
    );
  });
});

describe("canManageShoppingCategories", () => {
  it("allows solo account owners", () => {
    assert.equal(
      canManageShoppingCategories(
        { account_mode: ACCOUNT_MODE.SOLO, family_id: null, family_role: null },
        null,
        "user-1"
      ),
      true
    );
  });

  it("allows family founders and admins", () => {
    const family = { created_by: "founder-1" };

    assert.equal(
      canManageShoppingCategories(
        {
          account_mode: ACCOUNT_MODE.FAMILY,
          family_id: "family-1",
          family_role: FAMILY_ROLE.MEMBER,
        },
        family,
        "founder-1"
      ),
      true
    );

    assert.equal(
      canManageShoppingCategories(
        {
          account_mode: ACCOUNT_MODE.FAMILY,
          family_id: "family-1",
          family_role: FAMILY_ROLE.ADMIN,
        },
        family,
        "admin-1"
      ),
      true
    );
  });

  it("denies regular family members", () => {
    assert.equal(
      canManageShoppingCategories(
        {
          account_mode: ACCOUNT_MODE.FAMILY,
          family_id: "family-1",
          family_role: FAMILY_ROLE.MEMBER,
        },
        { created_by: "founder-1" },
        "member-1"
      ),
      false
    );
  });
});
