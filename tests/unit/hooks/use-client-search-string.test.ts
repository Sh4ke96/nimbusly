import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("layout shell navigation", () => {
  it("mobile bottom nav avoids useSearchParams", () => {
    const source = readFileSync(
      resolve("components/app/mobile-bottom-nav.tsx"),
      "utf8"
    );
    assert.doesNotMatch(source, /useSearchParams/);
    assert.match(source, /useClientSearchString/);
  });

  it("app layout does not wrap shell chrome in Suspense", () => {
    const source = readFileSync(resolve("app/(app)/layout.tsx"), "utf8");
    assert.doesNotMatch(source, /Suspense/);
  });
});
