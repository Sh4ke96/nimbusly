import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  DEMO_CHORE_ID,
  DEMO_SHOPPING_ITEM_ID,
  INITIAL_DEMO_SHOPPING_ITEMS,
} from "@/lib/demo/fixtures";
import { DEMO_VIEW } from "@/lib/constants/demo-mode";
import { useDemoStore } from "@/lib/stores/demo-store";

describe("demo store", () => {
  afterEach(() => {
    useDemoStore.getState().reset();
  });

  it("starts on dashboard with seed shopping items", () => {
    const state = useDemoStore.getState();
    assert.equal(state.activeView, DEMO_VIEW.DASHBOARD);
    assert.deepEqual(state.shoppingItems, INITIAL_DEMO_SHOPPING_ITEMS);
  });

  it("toggles shopping checked state locally", () => {
    useDemoStore.getState().toggleShoppingChecked(DEMO_SHOPPING_ITEM_ID.MILK);
    assert.equal(
      useDemoStore.getState().shoppingItems.find((item) => item.id === DEMO_SHOPPING_ITEM_ID.MILK)
        ?.checked,
      true
    );
  });

  it("bumps shopping quantity within bounds", () => {
    useDemoStore.getState().bumpShoppingQuantity(DEMO_SHOPPING_ITEM_ID.BREAD, 2);
    assert.equal(
      useDemoStore.getState().shoppingItems.find((item) => item.id === DEMO_SHOPPING_ITEM_ID.BREAD)
        ?.quantity,
      3
    );
  });

  it("resets interactive state", () => {
    useDemoStore.getState().toggleChoreDone(DEMO_CHORE_ID.TRASH);
    useDemoStore.getState().setActiveView(DEMO_VIEW.SHOPPING);
    useDemoStore.getState().reset();

    const state = useDemoStore.getState();
    assert.equal(state.activeView, DEMO_VIEW.DASHBOARD);
    assert.equal(
      state.choreItems.find((item) => item.id === DEMO_CHORE_ID.TRASH)?.done,
      true
    );
  });
});
