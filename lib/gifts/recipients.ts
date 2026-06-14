import { GIFT_FILTER_ALL } from "@/lib/constants/gifts";
import type { Lang } from "@/lib/constants/lang";
import type { GiftIdea } from "@/lib/gifts/types";
import { getGiftRecipientFilterKey, normalizeRecipientName } from "@/lib/gifts/types";
import { compareByLocale } from "@/lib/i18n/compare";
import { getDisplayName, type FamilyMember } from "@/lib/profile";

export type GiftRecipientFilterOption = {
  key: string;
  label: string;
  memberId?: string;
};

export function resolveGiftRecipientLabel(
  entry: Pick<GiftIdea, "recipient_member_id" | "recipient_name">,
  members: FamilyMember[]
): string {
  if (entry.recipient_member_id) {
    const member = members.find((m) => m.id === entry.recipient_member_id);
    if (member) return getDisplayName(member);
  }
  return normalizeRecipientName(entry.recipient_name);
}

export function buildGiftRecipientFilterOptions(
  entries: GiftIdea[],
  members: FamilyMember[],
  allLabel: string,
  lang: Lang
): GiftRecipientFilterOption[] {
  const options: GiftRecipientFilterOption[] = [
    { key: GIFT_FILTER_ALL, label: allLabel },
  ];

  const seen = new Set<string>();
  for (const entry of entries) {
    const key = getGiftRecipientFilterKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);

    options.push({
      key,
      label: resolveGiftRecipientLabel(entry, members),
      memberId: entry.recipient_member_id ?? undefined,
    });
  }

  return options.sort((a, b) => {
    if (a.key === GIFT_FILTER_ALL) return -1;
    if (b.key === GIFT_FILTER_ALL) return 1;
    return compareByLocale(a.label, b.label, lang);
  });
}

export function filterGiftIdeasByRecipient(
  entries: GiftIdea[],
  filterKey: string
): GiftIdea[] {
  if (filterKey === GIFT_FILTER_ALL) return entries;
  return entries.filter((entry) => getGiftRecipientFilterKey(entry) === filterKey);
}
