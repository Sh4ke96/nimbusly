import { LANG, type Lang } from "@/lib/constants/lang";
import { compareByLocale } from "@/lib/i18n/compare";
import { useProfileStore } from "@/lib/stores/profile-store";

export function getStoreSortLang(): Lang {
  const preferred = useProfileStore.getState().profile?.preferred_lang;
  if (preferred === LANG.EN || preferred === LANG.PL) return preferred;
  return LANG.PL;
}

export function compareNamesByProfileLang(a: string, b: string): number {
  return compareByLocale(a, b, getStoreSortLang());
}
