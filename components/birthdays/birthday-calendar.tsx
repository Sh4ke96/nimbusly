"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLang, useT } from "@/lib/lang-context";
import { buildMonthGrid, getMonthName, getWeekdayLabels, shiftMonth } from "@/lib/birthdays/calendar";
import { birthdayDateKey, formatBirthdayLabel, type BirthdayEntry } from "@/lib/birthdays/types";
import { getDisplayName } from "@/lib/profile";
import type { FamilyMember, Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface BirthdayCalendarProps {
  year: number;
  month: number;
  entries: BirthdayEntry[];
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onMonthChange: (year: number, month: number) => void;
}

function resolveCreatorName(
  createdBy: string,
  userId: string | undefined,
  profile: Profile | null,
  members: FamilyMember[]
): string | null {
  if (!userId) return null;
  if (createdBy === userId && profile) return getDisplayName(profile);
  const member = members.find((m) => m.id === createdBy);
  return member ? getDisplayName(member) : null;
}

export function BirthdayCalendar({
  year,
  month,
  entries,
  profile,
  members,
  userId,
  onMonthChange,
}: BirthdayCalendarProps) {
  const t = useT();
  const { lang } = useLang();
  const isFamily = profile?.account_mode === "family" && !!profile.family_id;

  const entriesByDay = useMemo(() => {
    const map = new Map<string, BirthdayEntry[]>();
    for (const entry of entries) {
      const key = birthdayDateKey(entry.birth_month, entry.birth_day);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  const cells = buildMonthGrid(year, month);
  const weekdays = getWeekdayLabels(lang);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const next = shiftMonth(year, month, -1);
              onMonthChange(next.year, next.month);
            }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-heading font-semibold text-lg">
            {getMonthName(month, lang)} {year}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const next = shiftMonth(year, month, 1);
              onMonthChange(next.year, next.month);
            }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px border border-border bg-border">
          {weekdays.map((label) => (
            <div
              key={label}
              className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {cells.map((cell, index) => {
            if (!cell.isCurrentMonth || cell.day === null) {
              return <div key={`empty-${index}`} className="min-h-24 bg-background" />;
            }

            const dayEntries = entriesByDay.get(birthdayDateKey(month, cell.day)) ?? [];

            return (
              <div
                key={`${month}-${cell.day}`}
                className={cn(
                  "min-h-24 bg-background p-2",
                  cell.isToday && "ring-2 ring-inset ring-primary/40"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    cell.isToday ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {cell.day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEntries.map((entry) => {
                    const creator = resolveCreatorName(entry.created_by, userId, profile, members);
                    const tooltip = (
                      <div className="space-y-1 text-left">
                        <p className="font-semibold">{entry.person_name}</p>
                        <p>{formatBirthdayLabel(entry)}</p>
                        {entry.description && <p className="opacity-90">{entry.description}</p>}
                        {isFamily && creator && (
                          <p className="opacity-75">
                            {t.birthdays.addedBy}: {creator}
                          </p>
                        )}
                      </div>
                    );

                    return (
                      <Tooltip key={entry.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="block w-full truncate rounded-none bg-primary/10 px-1.5 py-0.5 text-left text-[11px] font-medium text-primary hover:bg-primary/20"
                          >
                            {entry.person_name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {tooltip}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
