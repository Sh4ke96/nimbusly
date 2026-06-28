import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSameDocumentNavigation,
  shouldStartNavigationTransition,
} from "@/lib/navigation/should-start-transition";

const BASE = "https://nimbusly.pl/dashboard";

describe("shouldStartNavigationTransition", () => {
  it("starts for internal route changes", () => {
    assert.equal(
      shouldStartNavigationTransition("/shopping", BASE, "/dashboard", ""),
      true,
    );
  });

  it("ignores same path and search", () => {
    assert.equal(
      shouldStartNavigationTransition(
        "/dashboard?tab=profile",
        "https://nimbusly.pl/dashboard?tab=profile",
        "/dashboard",
        "tab=profile",
      ),
      false,
    );
  });

  it("starts when only search params change", () => {
    assert.equal(
      shouldStartNavigationTransition(
        "/dashboard?tab=security",
        "https://nimbusly.pl/dashboard?tab=profile",
        "/dashboard",
        "tab=profile",
      ),
      true,
    );
  });

  it("ignores hash-only links", () => {
    assert.equal(
      shouldStartNavigationTransition("#section", BASE, "/dashboard", ""),
      false,
    );
  });

  it("ignores external links", () => {
    assert.equal(
      shouldStartNavigationTransition("https://example.com", BASE, "/dashboard", ""),
      false,
    );
  });

  it("ignores mailto links", () => {
    assert.equal(
      shouldStartNavigationTransition("mailto:hi@nimbusly.pl", BASE, "/dashboard", ""),
      false,
    );
  });
});

describe("isSameDocumentNavigation", () => {
  it("matches pathname and search", () => {
    const target = new URL("https://nimbusly.pl/shopping?list=1");
    assert.equal(isSameDocumentNavigation(target, "/shopping", "list=1"), true);
    assert.equal(isSameDocumentNavigation(target, "/shopping", ""), false);
  });
});
