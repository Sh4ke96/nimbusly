import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatNimbusSessionGreeting, pickRandomNimbusJoke } from "@/lib/nimbus/banter";
import {
  markSessionGreetingShown,
  shouldShowSessionGreeting,
} from "@/lib/nimbus/session-greeting";

describe("formatNimbusSessionGreeting", () => {
  const templates = [
    "Cześć, {name}! Miło Cię widzieć.",
    "Witaj z powrotem, {name}!",
  ] as const;

  it("inserts display name when available", () => {
    const greeting = formatNimbusSessionGreeting(templates, "Artur");
    assert.ok(greeting.includes("Artur"));
  });

  it("drops name placeholder when display name is missing", () => {
    const greeting = formatNimbusSessionGreeting(templates, "   ");
    assert.equal(greeting.includes("{name}"), false);
    assert.ok(greeting.startsWith("Cześć") || greeting.startsWith("Witaj"));
  });
});

describe("pickRandomNimbusJoke", () => {
  it("returns null for empty list", () => {
    assert.equal(pickRandomNimbusJoke([]), null);
  });

  it("returns a joke from the list", () => {
    const jokes = ["Pierwszy żart", "Drugi żart"] as const;
    const joke = pickRandomNimbusJoke(jokes);
    assert.ok(joke === "Pierwszy żart" || joke === "Drugi żart");
  });
});

describe("session greeting storage", () => {
  it("tracks greeting per browser session", () => {
    const storage = new Map<string, string>();
    const mock = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">;

    const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: mock,
    });

    try {
      storage.clear();
      assert.equal(shouldShowSessionGreeting(), true);
      markSessionGreetingShown();
      assert.equal(shouldShowSessionGreeting(), false);
    } finally {
      if (original) {
        Object.defineProperty(globalThis, "sessionStorage", original);
      } else {
        Reflect.deleteProperty(globalThis, "sessionStorage");
      }
    }
  });
});
