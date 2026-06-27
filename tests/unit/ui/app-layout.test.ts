import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appPageClass } from "@/lib/ui/app-layout";

describe("appPageClass", () => {
  it("applies default width", () => {
    const classes = appPageClass("default");
    assert.match(classes, /max-w-5xl/);
    assert.match(classes, /px-4/);
  });

  it("applies named width tokens", () => {
    assert.match(appPageClass("compact"), /max-w-3xl/);
    assert.match(appPageClass("wide"), /max-w-6xl/);
  });

  it("merges optional className", () => {
    const classes = appPageClass("default", { className: "pb-20" });
    assert.match(classes, /pb-20/);
    assert.match(classes, /max-w-5xl/);
  });
});
