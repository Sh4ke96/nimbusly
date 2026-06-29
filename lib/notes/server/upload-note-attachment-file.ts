import type { SupabaseClient } from "@supabase/supabase-js";
import { NOTE_ATTACHMENT_MAX_COUNT } from "@/lib/constants/notes";
import {
  buildNoteAttachmentStoragePath,
  isAllowedNoteAttachmentMime,
  isValidNoteAttachmentSize,
} from "@/lib/notes/attachments";
import type { Database } from "@/lib/supabase/database.types";

type UploadMessages = {
  invalidType: string;
  tooLarge: string;
  notOwner: string;
  generic: string;
};

export async function assertNoteAttachmentOwner(
  supabase: SupabaseClient<Database>,
  noteId: string,
  userId: string
): Promise<boolean> {
  const { data: note } = await supabase
    .from("notes")
    .select("id")
    .eq("id", noteId)
    .eq("created_by", userId)
    .maybeSingle();

  return !!note;
}

export async function uploadNoteAttachmentFile(params: {
  supabase: SupabaseClient<Database>;
  userId: string;
  noteId: string;
  file: File;
  messages: UploadMessages;
  existingCount?: number;
}): Promise<string | null> {
  const { supabase, userId, noteId, file, messages, existingCount = 0 } = params;

  if (!(await assertNoteAttachmentOwner(supabase, noteId, userId))) {
    return messages.notOwner;
  }

  if (!isAllowedNoteAttachmentMime(file.type)) {
    return messages.invalidType;
  }
  if (!isValidNoteAttachmentSize(file.size)) {
    return messages.tooLarge;
  }

  if (existingCount >= NOTE_ATTACHMENT_MAX_COUNT) {
    return messages.generic;
  }

  const storagePath = buildNoteAttachmentStoragePath(userId, noteId, file.name);
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("note-attachments")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return messages.generic;

  const { error: insertError } = await supabase.from("note_attachments").insert({
    note_id: noteId,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    byte_size: file.size,
    created_by: userId,
  });

  if (insertError) {
    await supabase.storage.from("note-attachments").remove([storagePath]);
    return messages.generic;
  }

  return null;
}
