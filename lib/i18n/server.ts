import { cookies } from "next/headers";
import { LANG, LANG_COOKIE } from "@/lib/constants/lang";
import type { Lang } from "@/lib/constants/lang";
import { dict } from ".";

export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === LANG.EN ? LANG.EN : LANG.PL;
}

export async function getServerT() {
  const lang = await getServerLang();
  return dict[lang];
}
