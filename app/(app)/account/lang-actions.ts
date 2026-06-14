"use server";

import { LANG, type Lang } from "@/lib/constants/lang";
import { requireUser } from "@/lib/server-actions/require-user";

export async function updatePreferredLang(lang: Lang): Promise<void> {
  if (lang !== LANG.PL && lang !== LANG.EN) return;

  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ preferred_lang: lang, updated_at: new Date().toISOString() })
    .eq("id", user.id);
}
