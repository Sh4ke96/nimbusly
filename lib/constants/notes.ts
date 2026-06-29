export const NOTE_TITLE_MAX_LENGTH = 200;
export const NOTE_CONTENT_MAX_LENGTH = 5000;
export const NOTE_CATEGORY_NAME_MAX_LENGTH = 100;
export const NOTE_ICON_EMOJI_MAX_LENGTH = 16;

export const NOTE_FILTER_ALL = "all";
export const NOTE_FILTER_UNCATEGORIZED = "uncategorized";

/** Prefix in note title to surface it in dashboard “Needs attention”. */
export const NOTE_ATTENTION_TITLE_PREFIX = "!";

export const NOTE_CONTENT_FORMAT = {
  PLAIN: "plain",
  MARKDOWN: "markdown",
} as const;

export type NoteContentFormat =
  (typeof NOTE_CONTENT_FORMAT)[keyof typeof NOTE_CONTENT_FORMAT];

export const NOTE_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const NOTE_ATTACHMENT_MAX_COUNT = 10;

export const NOTE_ATTACHMENT_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;
