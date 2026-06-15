import {
  isValidMedicineExpiryDate,
  isValidMedicineName,
  normalizeMedicineName,
  parseMedicineItemFromForm,
} from "@/lib/medicine/types";
import { getProfileFamilyContext } from "@/lib/server-actions/require-user";
import type { AccountActionState } from "@/app/(app)/account/actions";
import type { Dict } from "@/lib/i18n/types";
import type { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type AppSupabase = Awaited<ReturnType<typeof createClient>>;

export type CreateMedicineItemContext = {
  t: Dict;
  user: User | null;
  supabase: AppSupabase;
  validateTakenBy?: (
    supabase: AppSupabase,
    takenBy: string | null,
    familyId: string | null
  ) => Promise<boolean>;
  resolveTakenByForSave?: (
    takenBy: string | null,
    familyId: string | null,
    userId: string
  ) => string | null;
};

function validateMedicineFields(parsed: ReturnType<typeof parseMedicineItemFromForm>): string | null {
  if (!isValidMedicineName(parsed.name)) return "name";
  if (!parsed.formType) return "form";
  if (!isValidMedicineExpiryDate(parsed.expiryDate)) return "expiry";
  if (!parsed.availability) return "availability";
  return null;
}

export async function executeCreateMedicineItem(
  { t, user, supabase, validateTakenBy, resolveTakenByForSave }: CreateMedicineItemContext,
  formData: FormData
): Promise<AccountActionState> {
  if (!user) return { error: t.account.errorUnauthorized };

  const parsed = parseMedicineItemFromForm(formData);
  const validationError = validateMedicineFields(parsed);

  if (validationError === "name") return { error: t.medicineCabinet.errorNameRequired };
  if (validationError === "form") return { error: t.medicineCabinet.errorFormRequired };
  if (validationError === "expiry") return { error: t.medicineCabinet.errorInvalidExpiry };
  if (validationError === "availability") return { error: t.medicineCabinet.errorAvailabilityRequired };
  if (validationError) return { error: t.medicineCabinet.errorGeneric };

  const { familyId } = await getProfileFamilyContext(supabase, user.id);
  const takenBy = resolveTakenByForSave
    ? resolveTakenByForSave(parsed.takenBy, familyId, user.id)
    : parsed.takenBy;

  if (validateTakenBy && !(await validateTakenBy(supabase, takenBy, familyId))) {
    return { error: t.medicineCabinet.errorInvalidTakenBy };
  }

  const { data: item, error } = await supabase
    .from("medicine_items")
    .insert({
      family_id: familyId,
      name: normalizeMedicineName(parsed.name),
      form_type: parsed.formType!,
      quantity: parsed.quantity,
      expiry_date: parsed.expiryDate,
      availability: parsed.availability!,
      location: parsed.location,
      notes: parsed.notes,
      taken_by: takenBy,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !item) return { error: t.medicineCabinet.errorGeneric };
  return { success: t.medicineCabinet.createdSuccess };
}
