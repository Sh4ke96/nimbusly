import { getServerLang, getServerT } from "@/lib/i18n/server";
import { buildPwaManifest } from "@/lib/pwa/build-manifest";

export default async function manifest() {
  const lang = await getServerLang();
  const t = await getServerT();
  return buildPwaManifest(t, lang);
}
