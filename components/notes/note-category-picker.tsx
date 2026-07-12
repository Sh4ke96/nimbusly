"use client";

import { StickyNote } from "lucide-react";
import { Label } from "@/components/ui/label";
import { NOTE_FORM_FIELD } from "@/lib/notes/types";
import type { NoteCategory } from "@/lib/notes/types";
import { useT } from "@/lib/lang-context";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";

interface NoteCategoryPickerProps {
  value: string;
  onChange: (categoryId: string) => void;
  categories: NoteCategory[];
  name?: string;
}

export function NoteCategoryPicker({
  value,
  onChange,
  categories,
  name = NOTE_FORM_FIELD.CATEGORY_ID,
}: NoteCategoryPickerProps) {
  const t = useT();

  return (
    <div className="space-y-2">
      <Label>{t.notes.categoryLabel}</Label>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onChange("")}
          className={selectionPickerTileButtonClasses(value === "", "gap-2")}
        >
          <StickyNote className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="font-medium">{t.notes.uncategorizedLabel}</span>
        </button>
        {categories.map((category) => {
          const selected = value === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={selectionPickerTileButtonClasses(selected, "gap-2")}
            >
              {category.icon_emoji && (
                <span className="text-lg leading-none" aria-hidden>
                  {category.icon_emoji}
                </span>
              )}
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
