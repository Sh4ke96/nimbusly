import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MOBILE_NAV_ITEM } from "@/lib/constants/mobile-nav";
import { isMobileNavActive } from "@/lib/mobile-nav/is-nav-active";

describe("isMobileNavActive", () => {
  it("marks home active on plain dashboard", () => {
    assert.equal(isMobileNavActive("/dashboard", "", MOBILE_NAV_ITEM.HOME), true);
    assert.equal(
      isMobileNavActive("/dashboard", "view=modules", MOBILE_NAV_ITEM.HOME),
      false
    );
  });

  it("marks modules active when view=modules", () => {
    assert.equal(
      isMobileNavActive("/dashboard", "view=modules", MOBILE_NAV_ITEM.MODULES),
      true
    );
    assert.equal(isMobileNavActive("/dashboard", "", MOBILE_NAV_ITEM.MODULES), false);
  });

  it("marks notifications and settings from pathname", () => {
    assert.equal(
      isMobileNavActive("/notifications", "", MOBILE_NAV_ITEM.NOTIFICATIONS),
      true
    );
    assert.equal(
      isMobileNavActive("/profile/settings", "", MOBILE_NAV_ITEM.SETTINGS),
      true
    );
    assert.equal(
      isMobileNavActive("/profile/settings/account", "", MOBILE_NAV_ITEM.SETTINGS),
      true
    );
  });
});
