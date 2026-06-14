import { cookies } from "next/headers";
import { dict } from ".";
import type { Lang } from "./types";

export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  return (store.get("nimbusly-lang")?.value ?? "pl") as Lang;
}

export async function getServerT() {
  const lang = await getServerLang();
  return dict[lang];
}
