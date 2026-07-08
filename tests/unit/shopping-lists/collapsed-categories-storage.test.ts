import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { SHOPPING_COLLAPSED_CATEGORIES_STORAGE_PREFIX } from "@/lib/constants/shopping-lists";
import {
  readCollapsedCategoryKeys,
  writeCollapsedCategoryKeys,
} from "@/lib/shopping-lists/collapsed-categories-storage";

function withSessionStorage(run: () => void) {
  const storage = new Map<string, string>();
  const mock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">;

  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: mock,
  });

  try {
    run();
  } finally {
    if (original) {
      Object.defineProperty(globalThis, "sessionStorage", original);
    } else {
      Reflect.deleteProperty(globalThis, "sessionStorage");
    }
  }
}

describe("collapsed-categories-storage", () => {
  const listId = "list-1";
  const key = `${SHOPPING_COLLAPSED_CATEGORIES_STORAGE_PREFIX}${listId}`;

  it("round-trips collapsed category keys per list", () => {
    withSessionStorage(() => {
      writeCollapsedCategoryKeys(listId, new Set(["cat-a", "cat-b"]));

      assert.deepEqual([...readCollapsedCategoryKeys(listId)].sort(), ["cat-a", "cat-b"]);
      assert.equal(sessionStorage.getItem(key), JSON.stringify(["cat-a", "cat-b"]));
    });
  });

  it("returns empty set when nothing stored", () => {
    withSessionStorage(() => {
      assert.equal(readCollapsedCategoryKeys(listId).size, 0);
    });
  });
});
