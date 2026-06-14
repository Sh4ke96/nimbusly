"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { GIFT_FILTER_ALL } from "@/lib/constants/gifts";
import type { GiftIdea } from "@/lib/gifts/types";
import { buildGiftRecipientFilterOptions } from "@/lib/gifts/recipients";
import { getGiftRecipientFilterKey } from "@/lib/gifts/types";
import type { FamilyMember } from "@/lib/profile";
import { useLang, useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface GiftRecipientFilterProps {
  ideas: GiftIdea[];
  members: FamilyMember[];
  value: string;
  onChange: (filterKey: string) => void;
}

export function GiftRecipientFilter({
  ideas,
  members,
  value,
  onChange,
}: GiftRecipientFilterProps) {
  const t = useT();
  const { lang } = useLang();
  const options = buildGiftRecipientFilterOptions(ideas, members, t.gifts.filterAll, lang);

  if (options.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.key;
        const member = option.memberId
          ? members.find((m) => m.id === option.memberId)
          : null;

        return (
          <Button
            key={option.key}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-none gap-2",
              !selected && "bg-background"
            )}
            onClick={() => onChange(option.key)}
          >
            {member && (
              <MemberAvatar
                name={option.label}
                color={member.avatar_color}
                size="xs"
              />
            )}
            {option.label}
            {option.key !== GIFT_FILTER_ALL && (
              <span className="text-[10px] opacity-70">
                ({ideas.filter((idea) => getGiftRecipientFilterKey(idea) === option.key).length})
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
