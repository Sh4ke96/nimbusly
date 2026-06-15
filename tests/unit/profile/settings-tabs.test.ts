import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SETTINGS_TAB } from "@/lib/constants/settings";
import { parseSettingsTab } from "@/lib/profile/settings-tabs";

describe("parseSettingsTab", () => {
  it("returns profile for unknown tab", () => {
    assert.equal(parseSettingsTab(null), SETTINGS_TAB.PROFILE);
    assert.equal(parseSettingsTab("unknown"), SETTINGS_TAB.PROFILE);
  });

  it("maps legacy permissions tab to family", () => {
    assert.equal(parseSettingsTab(SETTINGS_TAB.PERMISSIONS), SETTINGS_TAB.FAMILY);
  });

  it("keeps supported tabs unchanged", () => {
    assert.equal(parseSettingsTab(SETTINGS_TAB.FAMILY), SETTINGS_TAB.FAMILY);
    assert.equal(parseSettingsTab(SETTINGS_TAB.ACCOUNT), SETTINGS_TAB.ACCOUNT);
    assert.equal(parseSettingsTab(SETTINGS_TAB.PASSWORD), SETTINGS_TAB.PASSWORD);
  });
});
