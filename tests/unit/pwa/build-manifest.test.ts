import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LANG } from "@/lib/constants/lang";
import { dict } from "@/lib/i18n";
import { buildPwaManifest } from "@/lib/pwa/build-manifest";

describe("buildPwaManifest", () => {
  it("uses locale-specific description and shortcuts", () => {
    const pl = buildPwaManifest(dict.pl, LANG.PL);
    const en = buildPwaManifest(dict.en, LANG.EN);

    assert.equal(pl.lang, "pl");
    assert.equal(en.lang, "en");
    assert.equal(pl.description, dict.pl.pwa.manifestDescription);
    assert.equal(en.description, dict.en.pwa.manifestDescription);
    assert.equal(pl.shortcuts?.[0]?.name, dict.pl.pwa.shortcutDashboard);
    assert.equal(en.shortcuts?.[0]?.name, dict.en.pwa.shortcutDashboard);
    assert.notEqual(pl.shortcuts?.[1]?.short_name, en.shortcuts?.[1]?.short_name);
  });
});
