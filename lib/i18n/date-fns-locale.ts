import { enUS, pl } from "date-fns/locale";
import { LANG, type Lang } from "@/lib/constants/lang";

export const DATE_FNS_LOCALE_BY_LANG = {
  [LANG.PL]: pl,
  [LANG.EN]: enUS,
} as const satisfies Record<Lang, typeof pl>;

export function getDateFnsLocale(lang: Lang) {
  return DATE_FNS_LOCALE_BY_LANG[lang];
}
