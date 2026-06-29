import {
  NOTE_CATEGORY_NAME_MAX_LENGTH,
  NOTE_CONTENT_FORMAT,
  NOTE_CONTENT_MAX_LENGTH,
  NOTE_FILTER_ALL,
  NOTE_FILTER_UNCATEGORIZED,
  NOTE_TITLE_MAX_LENGTH,
  type NoteContentFormat,
} from "@/lib/constants/notes";
import { COMMON_FORM_FIELD } from "@/lib/form/common-fields";
import { getFormString, getFormTrimmedString } from "@/lib/form/values";
import { normalizeNoteIconEmoji } from "@/lib/notes/emoji";
import { parseVisibleMemberIdsJson } from "@/lib/notes/visibility";

export { NOTE_FILTER_ALL, NOTE_FILTER_UNCATEGORIZED };

export interface NoteCategory {
  id: string;
  family_id: string | null;
  name: string;
  icon_emoji: string | null;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  family_id: string | null;
  category_id: string | null;
  title: string;
  content: string;
  content_format: NoteContentFormat;
  is_pinned: boolean;
  visible_to_member_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NoteAttachment {
  id: string;
  note_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  byte_size: number;
  created_by: string;
  created_at: string;
}

export function isValidNoteTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= NOTE_TITLE_MAX_LENGTH;
}

export function isValidNoteContent(content: string): boolean {
  return content.length <= NOTE_CONTENT_MAX_LENGTH;
}

export function isValidNoteCategoryName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= NOTE_CATEGORY_NAME_MAX_LENGTH;
}

export function normalizeNoteCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function parseNoteVisibleMemberIdsFromForm(formData: FormData): string[] | null {
  return parseVisibleMemberIdsJson(
    getFormString(formData, NOTE_FORM_FIELD.VISIBLE_MEMBER_IDS)
  );
}

export function parseNoteCategoryIdFromForm(formData: FormData): string | null {
  const raw = getFormTrimmedString(formData, NOTE_FORM_FIELD.CATEGORY_ID);
  return raw || null;
}

export function parseNoteIconEmojiFromForm(formData: FormData): string | null {
  const raw = getFormTrimmedString(formData, NOTE_CATEGORY_FORM_FIELD.ICON_EMOJI);
  if (!raw) return null;
  return normalizeNoteIconEmoji(raw);
}

export const NOTE_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  TITLE: "title",
  CONTENT: "content",
  CATEGORY_ID: "categoryId",
  VISIBLE_MEMBER_IDS: "visibleMemberIds",
  IS_PINNED: "isPinned",
  CONTENT_FORMAT: "contentFormat",
} as const;

export const NOTE_CATEGORY_FORM_FIELD = {
  ID: COMMON_FORM_FIELD.ID,
  NAME: "name",
  ICON_EMOJI: "iconEmoji",
} as const;

export function parseNoteFromForm(formData: FormData): {
  title: string;
  content: string;
  categoryId: string | null;
  isPinned: boolean;
  contentFormat: NoteContentFormat;
} {
  const formatRaw = getFormTrimmedString(formData, NOTE_FORM_FIELD.CONTENT_FORMAT);
  return {
    title: getFormTrimmedString(formData, NOTE_FORM_FIELD.TITLE),
    content: getFormString(formData, NOTE_FORM_FIELD.CONTENT),
    categoryId: parseNoteCategoryIdFromForm(formData),
    isPinned: getFormString(formData, NOTE_FORM_FIELD.IS_PINNED) === "1",
    contentFormat:
      formatRaw === NOTE_CONTENT_FORMAT.MARKDOWN
        ? NOTE_CONTENT_FORMAT.MARKDOWN
        : NOTE_CONTENT_FORMAT.PLAIN,
  };
}

export function parseNoteIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, NOTE_FORM_FIELD.ID);
}

export function parseNoteCategoryFromForm(formData: FormData): {
  name: string;
  iconEmoji: string | null;
} {
  return {
    name: getFormTrimmedString(formData, NOTE_CATEGORY_FORM_FIELD.NAME),
    iconEmoji: parseNoteIconEmojiFromForm(formData),
  };
}

export function parseNoteCategoryRecordIdFromForm(formData: FormData): string {
  return getFormTrimmedString(formData, NOTE_CATEGORY_FORM_FIELD.ID);
}

export function getNoteCategoryFilterKey(categoryId: string | null): string {
  return categoryId ?? NOTE_FILTER_UNCATEGORIZED;
}

export function filterNotesByCategory(notes: Note[], filterKey: string): Note[] {
  if (filterKey === NOTE_FILTER_ALL) return notes;
  if (filterKey === NOTE_FILTER_UNCATEGORIZED) {
    return notes.filter((note) => !note.category_id);
  }
  return notes.filter((note) => note.category_id === filterKey);
}

export function sortNoteCategories(categories: NoteCategory[]): NoteCategory[] {
  return [...categories].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name, "pl");
  });
}

export function sortNotesByPinned(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function resolveNoteCategoryLabel(
  categoryId: string | null,
  categories: NoteCategory[],
  uncategorizedLabel: string
): string {
  if (!categoryId) return uncategorizedLabel;
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return uncategorizedLabel;
  return category.icon_emoji ? `${category.icon_emoji} ${category.name}` : category.name;
}
