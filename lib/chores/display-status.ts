import {
  CHORE_FORM_STATUSES,
  CHORE_STATUS,
  type ChoreFormStatus,
  type ChoreStatus,
} from "@/lib/constants/chores";

export function normalizeChoreStatusForDisplay(status: ChoreStatus): ChoreFormStatus {
  if (status === CHORE_STATUS.IN_PROGRESS) {
    return CHORE_STATUS.PENDING;
  }
  return status;
}

export function isChoreFormStatus(value: string): value is ChoreFormStatus {
  return (CHORE_FORM_STATUSES as readonly string[]).includes(value);
}
