"use client";

import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NOTE_ATTENTION_TITLE_PREFIX } from "@/lib/constants/notes";
import { NOTE_FORM_FIELD, type NoteCategory } from "@/lib/notes/types";
import { NoteCategoryPicker } from "@/components/notes/note-category-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  NoteVisibilityPicker,
  type NoteVisibilitySelection,
} from "@/components/notes/note-visibility-picker";
import type { FamilyMember, Profile } from "@/lib/profile";
import { formatMessage } from "@/lib/i18n/format";
import { useT } from "@/lib/lang-context";
import { Pin } from "lucide-react";

interface NoteEntryFormProps {
  id?: string;
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  categoryId: string;
  onCategoryIdChange: (value: string) => void;
  categories: NoteCategory[];
  visibility: NoteVisibilitySelection;
  onVisibilityChange: (value: NoteVisibilitySelection) => void;
  profile: Profile | null;
  members: FamilyMember[];
}

export function NoteEntryForm({
  id,
  title,
  onTitleChange,
  content,
  onContentChange,
  categoryId,
  onCategoryIdChange,
  categories,
  visibility,
  onVisibilityChange,
  profile,
  members,
}: NoteEntryFormProps) {
  const t = useT();
  const isFamily =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const titleId = id ? `${id}-title` : "note-title";
  const contentId = id ? `${id}-content` : "note-content";

  return (
    <>
      {id && <input type="hidden" name={NOTE_FORM_FIELD.ID} value={id} />}

      <div className="space-y-2 pt-2">
        <div className="flex gap-2.5 border border-attention/30 bg-attention/8 px-3 py-2.5">
          <Pin className="mt-0.5 size-4 shrink-0 text-attention" aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {formatMessage(t.notes.titleHint, { prefix: NOTE_ATTENTION_TITLE_PREFIX })}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={titleId}>{t.notes.titleLabel}</Label>
          <Input
            id={titleId}
            name={NOTE_FORM_FIELD.TITLE}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            maxLength={200}
            placeholder={t.notes.titlePlaceholder}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={contentId}>{t.notes.contentLabel}</Label>
        <Textarea
          id={contentId}
          name={NOTE_FORM_FIELD.CONTENT}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          maxLength={5000}
          rows={6}
          placeholder={t.notes.contentPlaceholder}
          className="rounded-none resize-y min-h-28"
        />
      </div>

      <NoteCategoryPicker
        value={categoryId}
        onChange={onCategoryIdChange}
        categories={categories}
      />

      {isFamily && (
        <NoteVisibilityPicker
          members={members}
          value={visibility}
          onChange={onVisibilityChange}
        />
      )}
    </>
  );
}
