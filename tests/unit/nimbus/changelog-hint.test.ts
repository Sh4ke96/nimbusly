import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildChangelogHintMessage } from "@/lib/nimbus/changelog-hint";
import { CHANGELOG_ENTRIES } from "@/lib/changelog/entries";
import { LANG } from "@/lib/constants/lang";

describe("buildChangelogHintMessage", () => {
  it("includes version and bullet points", () => {
    const latestVersion = CHANGELOG_ENTRIES[0]?.version ?? "";
    const message = buildChangelogHintMessage(
      LANG.PL,
      "Wersja {version}:",
      "Więcej na /change-log"
    );
    assert.ok(message);
    assert.match(message, new RegExp(latestVersion.replace(/\./g, "\\.")));
    assert.match(message, /•/);
    assert.match(message, /Więcej na \/change-log/);
  });
});
