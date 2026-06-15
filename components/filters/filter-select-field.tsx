"use client";

import { useFilterSheet } from "@/components/filters/filter-sheet-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILTER_ALL_VALUE } from "@/lib/filters/active-count";

import type { FilterToggleOption } from "@/components/filters/filter-toggle-group";

interface FilterSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterToggleOption[];
  placeholder: string;
  allValue?: string;
  hideZeroCount?: boolean;
  ariaLabel: string;
}

export function FilterSelectField({
  value,
  onChange,
  options,
  placeholder,
  allValue = FILTER_ALL_VALUE,
  hideZeroCount = true,
  ariaLabel,
}: FilterSelectFieldProps) {
  const filterSheet = useFilterSheet();

  const visibleOptions = options.filter((option) => {
    if (option.value === allValue) return true;
    if (!hideZeroCount) return true;
    return (option.count ?? 0) > 0;
  });

  if (visibleOptions.length <= 1) return null;

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        onChange(next);
        filterSheet?.close();
      }}
    >
      <SelectTrigger className="w-full bg-card" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {visibleOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined ? (
              <span className="text-muted-foreground"> ({option.count})</span>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
