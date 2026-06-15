"use server";

import { requireUser } from "@/lib/server-actions/require-user";

export async function updateNimbusCompanionEnabled(enabled: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      nimbus_companion_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}

export async function updateNimbusCompanionQuiet(quiet: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      nimbus_companion_quiet: quiet,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}
