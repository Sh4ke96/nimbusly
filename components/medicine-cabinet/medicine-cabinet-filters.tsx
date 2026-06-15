"use client";

import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import {
  MEDICINE_AVAILABILITIES,
  MEDICINE_FILTER_ALL,
} from "@/lib/constants/medicine";
import { countActiveFilters } from "@/lib/filters/active-count";
import { countMedicineByAvailability } from "@/lib/medicine/filters";
import type { MedicineItem } from "@/lib/medicine/types";
import { useT } from "@/lib/lang-context";

interface MedicineCabinetFiltersProps {
  items: MedicineItem[];
  value: string;
  onChange: (value: string) => void;
}

export function MedicineCabinetFilters({
  items,
  value,
  onChange,
}: MedicineCabinetFiltersProps) {
  const t = useT();
  const counts = countMedicineByAvailability(items);
  const activeCount = countActiveFilters([value], MEDICINE_FILTER_ALL);

  const options = [
    { value: MEDICINE_FILTER_ALL, label: t.medicineCabinet.filterAll, count: counts.all },
    ...MEDICINE_AVAILABILITIES.map((status) => ({
      value: status,
      label: t.medicineCabinet.availabilityLabels[status],
      count: counts[status],
    })),
  ];

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={() => onChange(MEDICINE_FILTER_ALL)}
    >
      <FilterSheetSection label={t.medicineCabinet.availabilityLabel}>
        <FilterToggleGroup
          value={value}
          onChange={onChange}
          options={options}
          allValue={MEDICINE_FILTER_ALL}
        />
      </FilterSheetSection>
    </FilterSheet>
  );
}
