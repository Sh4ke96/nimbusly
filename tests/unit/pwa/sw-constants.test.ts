import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { PWA_CACHE_NAME, PWA_PRECACHE_URLS } from "@/lib/constants/pwa";

describe("PWA service worker constants", () => {
  it("keeps public/sw.js in sync with lib/constants/pwa.ts", () => {
    const swSource = readFileSync(
      join(process.cwd(), "public", "sw.js"),
      "utf8"
    );

    assert.match(swSource, new RegExp(`CACHE_NAME = "${PWA_CACHE_NAME}"`));

    for (const url of PWA_PRECACHE_URLS) {
      assert.match(swSource, new RegExp(`"${url.replace("/", "\\/")}"`));
    }

    assert.match(swSource, /addEventListener\("push"/);
    assert.match(swSource, /addEventListener\("notificationclick"/);
  });
});
