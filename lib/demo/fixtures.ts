import { DEMO_MEMBER_ROLE } from "@/lib/constants/demo";

export const DEMO_SHOPPING_ITEM_ID = {
  MILK: "milk",
  BREAD: "bread",
  APPLES: "apples",
  COFFEE: "coffee",
} as const;

export type DemoShoppingItemId =
  (typeof DEMO_SHOPPING_ITEM_ID)[keyof typeof DEMO_SHOPPING_ITEM_ID];

export const DEMO_CHORE_ID = {
  DISHES: "dishes",
  TRASH: "trash",
  LAUNDRY: "laundry",
} as const;

export type DemoChoreId = (typeof DEMO_CHORE_ID)[keyof typeof DEMO_CHORE_ID];

export const DEMO_NOTE_ID = {
  SCHOOL: "school",
  VET: "vet",
} as const;

export interface DemoShoppingItemState {
  id: DemoShoppingItemId;
  checked: boolean;
  quantity: number;
}

export interface DemoChoreItemState {
  id: DemoChoreId;
  done: boolean;
}

export interface DemoNoteItemState {
  id: (typeof DEMO_NOTE_ID)[keyof typeof DEMO_NOTE_ID];
  pinned: boolean;
}

export const DEMO_FAMILY_MEMBERS = [
  { id: "anna", role: DEMO_MEMBER_ROLE.MOM, color: "#2b5748" },
  { id: "piotr", role: DEMO_MEMBER_ROLE.DAD, color: "#618764" },
  { id: "zuzia", role: DEMO_MEMBER_ROLE.DAUGHTER, color: "#9cb080" },
  { id: "kuba", role: DEMO_MEMBER_ROLE.SON, color: "#273338" },
] as const;

export const INITIAL_DEMO_SHOPPING_ITEMS: DemoShoppingItemState[] = [
  { id: DEMO_SHOPPING_ITEM_ID.MILK, checked: false, quantity: 2 },
  { id: DEMO_SHOPPING_ITEM_ID.BREAD, checked: false, quantity: 1 },
  { id: DEMO_SHOPPING_ITEM_ID.APPLES, checked: true, quantity: 1 },
  { id: DEMO_SHOPPING_ITEM_ID.COFFEE, checked: false, quantity: 1 },
];

export const INITIAL_DEMO_CHORE_ITEMS: DemoChoreItemState[] = [
  { id: DEMO_CHORE_ID.DISHES, done: false },
  { id: DEMO_CHORE_ID.TRASH, done: true },
  { id: DEMO_CHORE_ID.LAUNDRY, done: false },
];

export const INITIAL_DEMO_NOTES: DemoNoteItemState[] = [
  { id: DEMO_NOTE_ID.SCHOOL, pinned: true },
  { id: DEMO_NOTE_ID.VET, pinned: false },
];

export function createInitialDemoState() {
  return {
    shoppingItems: INITIAL_DEMO_SHOPPING_ITEMS.map((item) => ({ ...item })),
    choreItems: INITIAL_DEMO_CHORE_ITEMS.map((item) => ({ ...item })),
    notes: INITIAL_DEMO_NOTES.map((item) => ({ ...item })),
  };
}
