"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteNoteAttachment,
  uploadNoteAttachment,
} from "@/app/(app)/notes/attachment-actions";
import { NOTE_ATTACHMENT_MAX_BYTES } from "@/lib/constants/notes";
import { NOTE_FORM_FIELD, type NoteAttachment } from "@/lib/notes/types";
import { useT } from "@/lib/lang-context";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface NoteAttachmentsPanelProps {
  noteId: string;
}

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="size-4 shrink-0" aria-hidden />;
  }
  return <FileText className="size-4 shrink-0" aria-hidden />;
}

async function fetchNoteAttachments(noteId: string): Promise<NoteAttachment[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("note_attachments")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });
  return (data ?? []) as NoteAttachment[];
}

export function NoteAttachmentsPanel({ noteId }: NoteAttachmentsPanelProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadState, uploadAction, uploadPending] = useActionState(uploadNoteAttachment, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteNoteAttachment, null);

  const refreshAttachments = useCallback(async () => {
    const rows = await fetchNoteAttachments(noteId);
    setAttachments(rows);
    setLoading(false);
  }, [noteId]);

  useEffect(() => {
    let cancelled = false;

    void fetchNoteAttachments(noteId).then((rows) => {
      if (cancelled) return;
      setAttachments(rows);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [noteId]);

  useActionFeedback(uploadState, () => {
    void refreshAttachments();
  });

  useActionFeedback(deleteState, () => {
    void refreshAttachments();
  });

  async function openAttachment(attachment: NoteAttachment) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("note-attachments")
      .createSignedUrl(attachment.storage_path, 3600);

    if (error || !data?.signedUrl) {
      toast.error(t.notes.errorGeneric);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > NOTE_ATTACHMENT_MAX_BYTES) {
      toast.error(t.notes.attachmentTooLarge);
      return;
    }

    const formData = new FormData();
    formData.set(NOTE_FORM_FIELD.ID, noteId);
    formData.set("file", file);
    uploadAction(formData);
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
          disabled={uploadPending || deletePending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-4 mr-1" aria-hidden />
          {t.notes.attachmentUploadBtn}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={onFileSelected}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t.notes.attachmentsHint}</p>

      {loading ? (
        <p className="text-xs text-muted-foreground">…</p>
      ) : attachments.length === 0 ? null : (
        <ul className="space-y-1">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-2 border border-border/60 px-2 py-1.5 text-sm"
            >
              <AttachmentIcon mimeType={attachment.mime_type} />
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left hover:underline"
                onClick={() => void openAttachment(attachment)}
              >
                {attachment.file_name}
              </button>
              <form action={deleteAction}>
                <input type="hidden" name="attachment_id" value={attachment.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none text-destructive"
                  disabled={deletePending}
                  aria-label={t.notes.attachmentDeleteBtn}
                >
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
