"use client";

import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import { NOTE_FILTER_ALL, NOTE_FILTER_UNCATEGORIZED, type Note, type NoteCategory } from "@/lib/notes/types";
import { countActiveFilters } from "@/lib/filters/active-count";
import { useT } from "@/lib/lang-context";

interface NotesFiltersProps {
  notes: Note[];
  categories: NoteCategory[];
  value: string;
  onChange: (value: string) => void;
}

export function NotesFilters({ notes, categories, value, onChange }: NotesFiltersProps) {
  const t = useT();

  const options = [
    { value: NOTE_FILTER_ALL, label: t.notes.filterAll },
    { value: NOTE_FILTER_UNCATEGORIZED, label: t.notes.uncategorizedLabel },
    ...categories.map((category) => ({
      value: category.id,
      label: category.icon_emoji ? `${category.icon_emoji} ${category.name}` : category.name,
    })),
  ];

  if (options.length <= 1) return null;

  const activeCount = countActiveFilters([value], NOTE_FILTER_ALL);

  return (
    <FilterSheet
      title={t.notes.filterTitle}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={() => onChange(NOTE_FILTER_ALL)}
    >
      <FilterSheetSection label={t.notes.categoryLabel}>
        <FilterToggleGroup
          value={value}
          onChange={onChange}
          options={options.map((option) => ({
            value: option.value,
            label: option.label,
            count:
              option.value === NOTE_FILTER_ALL
                ? notes.length
                : option.value === NOTE_FILTER_UNCATEGORIZED
                  ? notes.filter((note) => !note.category_id).length
                  : notes.filter((note) => note.category_id === option.value).length,
          }))}
          allValue={NOTE_FILTER_ALL}
          hideZeroCount={false}
        />
      </FilterSheetSection>
    </FilterSheet>
  );
}
