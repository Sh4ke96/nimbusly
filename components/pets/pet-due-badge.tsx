"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { PET_DUE_STATUS } from "@/lib/constants/pets";
import { formatPetDueCountdown, getPetDueStatus } from "@/lib/pets/due";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface PetDueBadgeProps {
  dueDate: string | null;
}

export function PetDueBadge({ dueDate }: PetDueBadgeProps) {
  const t = useT();
  const status = getPetDueStatus(dueDate);

  if (status === PET_DUE_STATUS.NONE || status === PET_DUE_STATUS.OK) {
    return null;
  }

  const isOverdue = status === PET_DUE_STATUS.OVERDUE;
  const label =
    formatPetDueCountdown(dueDate, t.pets) ?? t.pets.dueSoon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[11px] font-medium",
        isOverdue
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
      )}
    >
      {isOverdue ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}
      {label}
    </span>
  );
}
