import { MEDICINE_FILTER_ALL } from "@/lib/constants/medicine";
import type { MedicineAvailability } from "@/lib/constants/medicine";
import type { MedicineItem } from "@/lib/medicine/types";

export function filterMedicineByAvailability(
  items: MedicineItem[],
  filterKey: string
): MedicineItem[] {
  if (filterKey === MEDICINE_FILTER_ALL) return items;
  return items.filter((item) => item.availability === filterKey);
}

export function countMedicineByAvailability(
  items: MedicineItem[]
): Record<MedicineAvailability | "all", number> {
  const counts = {
    all: items.length,
    in_stock: 0,
    low: 0,
    out_of_stock: 0,
    to_buy: 0,
  } as Record<MedicineAvailability | "all", number>;

  for (const item of items) {
    counts[item.availability] += 1;
  }

  return counts;
}
