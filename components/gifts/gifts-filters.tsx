"use client";

import { MemberAvatar } from "@/components/member-avatar";
import {
  FilterSheet,
  FilterSheetSection,
  FilterToggleGroup,
} from "@/components/filters";
import { GIFT_FILTER_ALL } from "@/lib/constants/gifts";
import { buildGiftRecipientFilterOptions } from "@/lib/gifts/recipients";
import type { GiftIdea } from "@/lib/gifts/types";
import { getGiftRecipientFilterKey } from "@/lib/gifts/types";
import { countActiveFilters } from "@/lib/filters/active-count";
import type { FamilyMember } from "@/lib/profile";
import { useLang, useT } from "@/lib/lang-context";

interface GiftsFiltersProps {
  ideas: GiftIdea[];
  members: FamilyMember[];
  value: string;
  onChange: (value: string) => void;
}

export function GiftsFilters({ ideas, members, value, onChange }: GiftsFiltersProps) {
  const t = useT();
  const { lang } = useLang();
  const options = buildGiftRecipientFilterOptions(ideas, members, t.gifts.filterAll, lang);

  if (options.length <= 1) return null;

  const activeCount = countActiveFilters([value], GIFT_FILTER_ALL);

  return (
    <FilterSheet
      title={t.common.filters}
      description={t.common.filtersDescription}
      activeCount={activeCount}
      onClear={() => onChange(GIFT_FILTER_ALL)}
    >
      <FilterSheetSection label={t.gifts.recipientLabel}>
        <FilterToggleGroup
          value={value}
          onChange={onChange}
          options={options.map((option) => {
            const member = option.memberId
              ? members.find((entry) => entry.id === option.memberId)
              : null;

            return {
              value: option.key,
              label: option.label,
              count:
                option.key === GIFT_FILTER_ALL
                  ? ideas.length
                  : ideas.filter((idea) => getGiftRecipientFilterKey(idea) === option.key)
                      .length,
              leading: member ? (
                <MemberAvatar name={option.label} color={member.avatar_color} size="xs" />
              ) : undefined,
            };
          })}
          allValue={GIFT_FILTER_ALL}
          hideZeroCount={false}
        />
      </FilterSheetSection>
    </FilterSheet>
  );
}
