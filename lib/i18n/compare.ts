import { LOCALE_BY_LANG, type Lang } from "@/lib/constants/lang";

export function compareByLocale(a: string, b: string, lang: Lang): number {
  return a.localeCompare(b, LOCALE_BY_LANG[lang]);
}
