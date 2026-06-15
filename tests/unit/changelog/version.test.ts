import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { APP_VERSION, getChangelogEntries } from "@/lib/changelog/entries";

describe("changelog version", () => {
  it("matches package.json version", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as { version: string };
    assert.equal(APP_VERSION, packageJson.version);
  });

  it("lists entries newest first", () => {
    const entries = getChangelogEntries();
    assert.ok(entries.length >= 1);
    for (let i = 1; i < entries.length; i += 1) {
      assert.ok(entries[i - 1].date >= entries[i].date);
    }
  });
});
