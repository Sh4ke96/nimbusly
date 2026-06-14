import { CHORE_STATUS } from "@/lib/constants/chores";
import {
  countActiveChores,
  isChoreOverdue,
  sortChoresForDisplay,
} from "@/lib/chores/filters";
import type { ChoreTask } from "@/lib/chores/types";

export { countActiveChores };

export function countOverdueChores(tasks: ChoreTask[]): number {
  return tasks.filter((task) => isChoreOverdue(task)).length;
}

export function pickActiveChorePreview(tasks: ChoreTask[], limit = 3): ChoreTask[] {
  const active = sortChoresForDisplay(
    tasks.filter(
      (task) =>
        task.status === CHORE_STATUS.PENDING || task.status === CHORE_STATUS.IN_PROGRESS
    )
  );

  return active.slice(0, limit);
}
