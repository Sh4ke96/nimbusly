import { cookies } from "next/headers";
import { dict } from ".";
import type { Lang } from "./types";

export async function getServerT() {
  const store = await cookies();
  const lang = (store.get("nimbusly-lang")?.value ?? "pl") as Lang;
  return dict[lang];
}
