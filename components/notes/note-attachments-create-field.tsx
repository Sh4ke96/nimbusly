"use client";

import { useRef } from "react";
import { FileText, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NOTE_ATTACHMENT_ALLOWED_MIME,
  NOTE_ATTACHMENT_MAX_BYTES,
  NOTE_ATTACHMENT_MAX_COUNT,
} from "@/lib/constants/notes";
import { isAllowedNoteAttachmentMime } from "@/lib/notes/attachments";
import { useT } from "@/lib/lang-context";
import { toast } from "sonner";

interface NoteAttachmentsCreateFieldProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="size-4 shrink-0" aria-hidden />;
  }
  return <FileText className="size-4 shrink-0" aria-hidden />;
}

export function NoteAttachmentsCreateField({
  files,
  onFilesChange,
  disabled = false,
}: NoteAttachmentsCreateFieldProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    const next = [...files];
    for (const file of selected) {
      if (next.length >= NOTE_ATTACHMENT_MAX_COUNT) {
        toast.error(t.notes.errorGeneric);
        break;
      }
      if (!isAllowedNoteAttachmentMime(file.type)) {
        toast.error(t.notes.attachmentInvalidType);
        continue;
      }
      if (file.size > NOTE_ATTACHMENT_MAX_BYTES) {
        toast.error(t.notes.attachmentTooLarge);
        continue;
      }
      next.push(file);
    }
    onFilesChange(next);
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2 border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t.notes.attachmentsLabel}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-none"
          disabled={disabled || files.length >= NOTE_ATTACHMENT_MAX_COUNT}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-4 mr-1" aria-hidden />
          {t.notes.attachmentUploadBtn}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          multiple
          accept={NOTE_ATTACHMENT_ALLOWED_MIME.join(",")}
          onChange={onFileSelected}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t.notes.attachmentsHint}</p>

      {files.length > 0 ? (
        <ul className="space-y-1">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-2 border border-border/60 px-2 py-1.5 text-sm"
            >
              <AttachmentIcon mimeType={file.type} />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-none text-destructive"
                disabled={disabled}
                aria-label={t.notes.attachmentDeleteBtn}
                onClick={() => removeFile(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
