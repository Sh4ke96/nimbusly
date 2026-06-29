import {
  NOTE_ATTACHMENT_ALLOWED_MIME,
  NOTE_ATTACHMENT_MAX_BYTES,
} from "@/lib/constants/notes";

export function sanitizeNoteAttachmentFileName(fileName: string): string {
  const base = fileName.trim().replace(/[/\\?%*:|"<>]/g, "_");
  return base.slice(0, 200) || "file";
}

export function isAllowedNoteAttachmentMime(mimeType: string): boolean {
  return (NOTE_ATTACHMENT_ALLOWED_MIME as readonly string[]).includes(mimeType);
}

export function isValidNoteAttachmentSize(byteSize: number): boolean {
  return byteSize > 0 && byteSize <= NOTE_ATTACHMENT_MAX_BYTES;
}

export function buildNoteAttachmentStoragePath(
  userId: string,
  noteId: string,
  fileName: string
): string {
  const id = crypto.randomUUID();
  return `${userId}/${noteId}/${id}-${sanitizeNoteAttachmentFileName(fileName)}`;
}
