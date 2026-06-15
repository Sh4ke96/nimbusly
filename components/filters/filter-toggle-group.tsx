"use client";

import type { ReactNode } from "react";

import { useFilterSheet } from "@/components/filters/filter-sheet-context";
import { Button } from "@/components/ui/button";
import { FILTER_ALL_VALUE } from "@/lib/filters/active-count";
import { cn } from "@/lib/utils";

export interface FilterToggleOption {
  value: string;
  label: string;
  count?: number;
  leading?: ReactNode;
}

interface FilterToggleGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterToggleOption[];
  allValue?: string;
  hideZeroCount?: boolean;
  className?: string;
}

export function FilterToggleGroup({
  value,
  onChange,
  options,
  allValue = FILTER_ALL_VALUE,
  hideZeroCount = true,
  className,
}: FilterToggleGroupProps) {
  const filterSheet = useFilterSheet();

  const visibleOptions = options.filter((option) => {
    if (option.value === allValue) return true;
    if (!hideZeroCount) return true;
    return (option.count ?? 0) > 0;
  });

  if (visibleOptions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "outline"}
          className="cursor-pointer rounded-none gap-2"
          onClick={() => {
            onChange(option.value);
            filterSheet?.close();
          }}
        >
          {option.leading}
          {option.label}
          {option.count !== undefined ? (
            <span className="ml-1 opacity-70">({option.count})</span>
          ) : null}
        </Button>
      ))}
    </div>
  );
}
