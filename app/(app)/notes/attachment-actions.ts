"use server";

import { getServerT } from "@/lib/i18n/server";
import { NOTE_ATTACHMENT_MAX_COUNT } from "@/lib/constants/notes";
import {
  buildNoteAttachmentStoragePath,
  isAllowedNoteAttachmentMime,
  isValidNoteAttachmentSize,
} from "@/lib/notes/attachments";
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

  const { data: note } = await supabase
    .from("notes")
    .select("id")
    .eq("id", noteId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!note) return { error: t.notes.errorNotOwner };

  if (!isAllowedNoteAttachmentMime(file.type)) {
    return { error: t.notes.attachmentInvalidType };
  }
  if (!isValidNoteAttachmentSize(file.size)) {
    return { error: t.notes.attachmentTooLarge };
  }

  const { count } = await supabase
    .from("note_attachments")
    .select("*", { count: "exact", head: true })
    .eq("note_id", noteId);

  if ((count ?? 0) >= NOTE_ATTACHMENT_MAX_COUNT) {
    return { error: t.notes.errorGeneric };
  }

  const storagePath = buildNoteAttachmentStoragePath(user.id, noteId, file.name);
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("note-attachments")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return { error: t.notes.errorGeneric };

  const { error: insertError } = await supabase.from("note_attachments").insert({
    note_id: noteId,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    byte_size: file.size,
    created_by: user.id,
  });

  if (insertError) {
    await supabase.storage.from("note-attachments").remove([storagePath]);
    return { error: t.notes.errorGeneric };
  }

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
