import type { ShoppingList, ShoppingListItem } from "@/lib/shopping-lists/types";
import { downloadCsv, sanitizeCsvFilename } from "@/lib/budget/export-csv";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function buildShoppingListCsv(params: {
  list: ShoppingList;
  items: ShoppingListItem[];
  labels: {
    item: string;
    checked: string;
    yes: string;
    no: string;
  };
}): string {
  const header = [params.labels.item, params.labels.checked]
    .map(escapeCsvCell)
    .join(",");

  const rows = params.items.map((item) =>
    [
      item.content,
      item.checked ? params.labels.yes : params.labels.no,
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(",")
  );

  return [header, ...rows].join("\n");
}

export function downloadShoppingListCsv(params: {
  list: ShoppingList;
  items: ShoppingListItem[];
  labels: Parameters<typeof buildShoppingListCsv>[0]["labels"];
}): void {
  const content = buildShoppingListCsv(params);
  const filename = `${sanitizeCsvFilename(params.list.name)}-shopping.csv`;
  downloadCsv(filename, content);
}
