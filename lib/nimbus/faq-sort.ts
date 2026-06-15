import {
  NIMBUS_FAQ_MODULE_LABEL_KEY,
  type NimbusFaqId,
} from "@/lib/nimbus/faq";

type FaqModuleLabelKey =
  (typeof NIMBUS_FAQ_MODULE_LABEL_KEY)[keyof typeof NIMBUS_FAQ_MODULE_LABEL_KEY];

const PATH_FAQ_MODULE_BOOST: Record<string, FaqModuleLabelKey[]> = {
  "/budget": ["budget"],
  "/shopping": ["shopping"],
  "/notes": ["notes"],
  "/chores": ["chores"],
  "/birthdays": ["birthdays"],
  "/notifications": ["notifications"],
  "/dashboard": ["dashboard", "search"],
  "/gifts": ["settings"],
  "/schedule": ["birthdays"],
  "/medicine-cabinet": ["settings"],
  "/watchlist": ["settings"],
  "/restaurants": ["settings"],
  "/pets": ["settings"],
};

function getFaqModuleBoostForPath(pathname: string): FaqModuleLabelKey[] {
  if (pathname.startsWith("/profile/settings")) return ["settings"];
  return PATH_FAQ_MODULE_BOOST[pathname] ?? [];
}

export function sortFaqIdsForPath(ids: NimbusFaqId[], pathname: string): NimbusFaqId[] {
  const boost = new Set(getFaqModuleBoostForPath(pathname));
  if (boost.size === 0) return ids;

  const boosted: NimbusFaqId[] = [];
  const rest: NimbusFaqId[] = [];

  for (const id of ids) {
    if (boost.has(NIMBUS_FAQ_MODULE_LABEL_KEY[id])) {
      boosted.push(id);
    } else {
      rest.push(id);
    }
  }

  return [...boosted, ...rest];
}
