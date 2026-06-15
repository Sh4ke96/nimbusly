"use client";

import { NOTE_CATEGORY_FORM_FIELD } from "@/lib/notes/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteCategoryEmojiPicker } from "@/components/notes/note-category-emoji-picker";
import { useT } from "@/lib/lang-context";

interface NoteCategoryFormProps {
  id?: string;
  name: string;
  onNameChange: (value: string) => void;
  iconEmoji: string | null;
  onIconEmojiChange: (value: string | null) => void;
}

export function NoteCategoryForm({
  id,
  name,
  onNameChange,
  iconEmoji,
  onIconEmojiChange,
}: NoteCategoryFormProps) {
  const t = useT();
  const nameId = id ? `${id}-name` : "note-category-name";

  return (
    <>
      {id && <input type="hidden" name={NOTE_CATEGORY_FORM_FIELD.ID} value={id} />}

      <NoteCategoryEmojiPicker value={iconEmoji} onChange={onIconEmojiChange} />

      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t.notes.categoryNameLabel}</Label>
        <Input
          id={nameId}
          name={NOTE_CATEGORY_FORM_FIELD.NAME}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={100}
          placeholder={t.notes.categoryNamePlaceholder}
        />
      </div>
    </>
  );
}
