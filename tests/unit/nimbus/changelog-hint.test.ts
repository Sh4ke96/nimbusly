import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildChangelogHintMessage } from "@/lib/nimbus/changelog-hint";
import { LANG } from "@/lib/constants/lang";

describe("buildChangelogHintMessage", () => {
  it("includes version and bullet points", () => {
    const message = buildChangelogHintMessage(
      LANG.PL,
      "Wersja {version}:",
      "Więcej na /change-log"
    );
    assert.ok(message);
    assert.match(message, /0\.3\.0/);
    assert.match(message, /•/);
    assert.match(message, /Więcej na \/change-log/);
  });
});
