"use server";

import { getServerT } from "@/lib/i18n/server";
import { uploadNoteAttachmentFile } from "@/lib/notes/server/upload-note-attachment-file";
import { parseNoteIdFromForm } from "@/lib/notes/types";
import type { AccountActionState } from "@/app/(app)/account/actions";
import { requireUser } from "@/lib/server-actions/require-user";

const ATTACHMENT_FORM_FIELD = {
  FILE: "file",
  ATTACHMENT_ID: "attachment_id",
} as const;

export async function uploadNoteAttachment(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const noteId = parseNoteIdFromForm(formData);
  if (!noteId) return { error: t.notes.errorGeneric };

  const file = formData.get(ATTACHMENT_FORM_FIELD.FILE);
  if (!(file instanceof File) || file.size === 0) {
    return { error: t.notes.errorGeneric };
  }

  const { count } = await supabase
    .from("note_attachments")
    .select("*", { count: "exact", head: true })
    .eq("note_id", noteId);

  const error = await uploadNoteAttachmentFile({
    supabase,
    userId: user.id,
    noteId,
    file,
    existingCount: count ?? 0,
    messages: {
      invalidType: t.notes.attachmentInvalidType,
      tooLarge: t.notes.attachmentTooLarge,
      notOwner: t.notes.errorNotOwner,
      generic: t.notes.errorGeneric,
    },
  });

  if (error) return { error };
  return { success: t.notes.attachmentUploadedSuccess };
}

export async function deleteNoteAttachment(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const t = await getServerT();
  const { supabase, user } = await requireUser();
  if (!user) return { error: t.account.errorUnauthorized };

  const attachmentId = formData.get(ATTACHMENT_FORM_FIELD.ATTACHMENT_ID);
  if (typeof attachmentId !== "string" || !attachmentId) {
    return { error: t.notes.errorGeneric };
  }

  const { data: attachment } = await supabase
    .from("note_attachments")
    .select("id, storage_path")
    .eq("id", attachmentId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!attachment) return { error: t.notes.errorNotOwner };

  await supabase.storage.from("note-attachments").remove([attachment.storage_path]);

  const { error } = await supabase
    .from("note_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("created_by", user.id);

  if (error) return { error: t.notes.errorGeneric };

  return { success: t.notes.attachmentDeletedSuccess };
}
