import {
  isValidPetName,
  isValidPetNotes,
  normalizePetName,
  parsePetFromForm,
} from "@/lib/pets/types";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { getDisplayName } from "@/lib/profile";
import { getProfileFamilyContext } from "@/lib/server-actions/require-user";
import type { AccountActionState } from "@/app/(app)/account/actions";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

type NotifyFamilyMembers = (
  supabase: AppSupabase,
  params: {
    type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
    actorId: string;
    actorName: string;
    familyId: string;
    body: string;
    payload: Record<string, unknown>;
  }
) => Promise<void>;

export type CreatePetContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  notifyFamilyMembers?: NotifyFamilyMembers;
};

export async function executeCreatePet(
  { t, user, supabase, notifyFamilyMembers }: CreatePetContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parsePetFromForm(formData);
  if (!isValidPetName(parsed.name)) return { error: t.pets.errorNameRequired };
  if (!parsed.species) return { error: t.pets.errorSpeciesRequired };
  if (!isValidPetNotes(parsed.notes)) return { error: t.pets.errorGeneric };

  const { profile, familyId } = await getProfileFamilyContext(supabase, user.id);
  const name = normalizePetName(parsed.name);

  const { data: pet, error } = await supabase
    .from("pets")
    .insert({
      family_id: familyId,
      name,
      species: parsed.species,
      notes: parsed.notes,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !pet) return { error: t.pets.errorGeneric };

  if (familyId && profile && notifyFamilyMembers) {
    try {
      await notifyFamilyMembers(supabase, {
        type: NOTIFICATION_TYPE.PET_ADDED,
        actorId: user.id,
        actorName: getDisplayName(profile),
        familyId,
        body: `${name}${t.notifications.notificationBodySeparator}${t.pets.speciesLabels[parsed.species]}`,
        payload: {
          pet_id: pet.id,
          pet_name: name,
          actor_id: user.id,
          family_id: familyId,
        },
      });
    } catch {
      // Best-effort
    }
  }

  return { success: t.pets.petCreatedSuccess };
}
