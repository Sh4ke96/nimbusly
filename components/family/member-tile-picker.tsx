"use client";

import { MemberAvatar } from "@/components/member-avatar";
import { selectionPickerTileButtonClasses } from "@/lib/ui/selection-styles";
import { getDisplayName, type FamilyMember } from "@/lib/profile";
import { cn } from "@/lib/utils";

type MemberTileGridProps = {
  members: FamilyMember[];
  nameClassName?: string;
  gridClassName?: string;
};

export type MemberTilePickerProps =
  | (MemberTileGridProps & {
      mode: "single-nullable";
      value: string | null;
      onChange: (memberId: string | null) => void;
      unassignedLabel: string;
    })
  | (MemberTileGridProps & {
      mode: "single";
      value: string;
      onChange: (memberId: string) => void;
    })
  | (MemberTileGridProps & {
      mode: "multi";
      selectedIds: string[];
      onChange: (memberIds: string[]) => void;
    });

function MemberTileButton({
  member,
  selected,
  onClick,
  nameClassName,
}: {
  member: FamilyMember;
  selected: boolean;
  onClick: () => void;
  nameClassName: string;
}) {
  return (
    <button
      key={member.id}
      type="button"
      onClick={onClick}
      className={selectionPickerTileButtonClasses(selected, "gap-2 py-2")}
      aria-pressed={selected}
    >
      <MemberAvatar name={getDisplayName(member)} color={member.avatar_color} size="sm" />
      <span className={nameClassName}>{getDisplayName(member)}</span>
    </button>
  );
}

export function MemberTilePicker(props: MemberTilePickerProps) {
  const gridClass = props.gridClassName ?? "grid gap-2 sm:grid-cols-2";
  const nameClass = props.nameClassName ?? "font-medium";

  if (props.mode === "multi") {
    const { selectedIds, onChange, members } = props;

    return (
      <div className={cn(gridClass)}>
        {members.map((member) => {
          const selected = selectedIds.includes(member.id);
          return (
            <MemberTileButton
              key={member.id}
              member={member}
              selected={selected}
              onClick={() => {
                if (selected) {
                  onChange(selectedIds.filter((id) => id !== member.id));
                  return;
                }
                onChange([...selectedIds, member.id]);
              }}
              nameClassName={nameClass}
            />
          );
        })}
      </div>
    );
  }

  if (props.mode === "single-nullable") {
    return (
      <div className={cn(gridClass)}>
        <button
          type="button"
          onClick={() => props.onChange(null)}
          className={selectionPickerTileButtonClasses(props.value === null)}
        >
          {props.unassignedLabel}
        </button>
        {props.members.map((member) => (
          <MemberTileButton
            key={member.id}
            member={member}
            selected={props.value === member.id}
            onClick={() => props.onChange(member.id)}
            nameClassName={nameClass}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(gridClass)}>
      {props.members.map((member) => (
        <MemberTileButton
          key={member.id}
          member={member}
          selected={props.value === member.id}
          onClick={() => props.onChange(member.id)}
          nameClassName={nameClass}
        />
      ))}
    </div>
  );
}
