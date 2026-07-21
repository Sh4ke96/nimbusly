import { NOTE_CONTENT_FORMAT, type NoteContentFormat } from "@/lib/constants/notes";
import { sanitizeMarkdownLinkUrl } from "@/lib/notes/sanitize-markdown-link";

const MARKDOWN_LINK_PATTERN = /\[([^\]]*)\]\(([^)]+)\)/g;

export function sanitizeNoteMarkdownContent(
  content: string,
  contentFormat: NoteContentFormat
): string {
  if (contentFormat !== NOTE_CONTENT_FORMAT.MARKDOWN) {
    return content;
  }

  return content.replace(MARKDOWN_LINK_PATTERN, (match, label: string, url: string) => {
    const safeUrl = sanitizeMarkdownLinkUrl(url);
    if (!safeUrl) {
      return label;
    }
    return `[${label}](${safeUrl})`;
  });
}
