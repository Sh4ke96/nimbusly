"use client";

import { format } from "date-fns";
import { useActionState } from "react";
import {
  AlertTriangle,
  Calendar,
  CircleCheck,
  Pencil,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import { resolveChoreAssigneeName } from "@/components/chores/chore-assignee-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  CHORE_RECURRENCE,
  CHORE_STATUSES,
  CHORE_STATUS,
} from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";
import { parseChoreDateString } from "@/lib/chores/types";
import { isChoreOverdue } from "@/lib/chores/filters";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import {
  deleteChoreTask,
  setChoreTaskStatus,
} from "@/app/(app)/chores/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";

interface ChoreTaskCardProps {
  task: ChoreTask;
  profile: Profile | null;
  members: FamilyMember[];
  userId: string | undefined;
  onEdit?: () => void;
  onChanged?: () => void;
}

const statusStyles: Record<ChoreTask["status"], string> = {
  [CHORE_STATUS.PENDING]: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20",
  [CHORE_STATUS.IN_PROGRESS]:
    "bg-violet-500/10 text-violet-800 dark:text-violet-300 border-violet-500/20",
  [CHORE_STATUS.COMPLETED]: "bg-primary/10 text-primary border-primary/20",
};

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

function formatDueDateLabel(
  value: string | null,
  locale: ReturnType<typeof getDateFnsLocale>
): string | null {
  if (!value) return null;
  const parsed = parseChoreDateString(value);
  if (!parsed) return null;
  return format(parsed, "d MMM yyyy", { locale });
}

function formatCompletedAtLabel(
  value: string | null,
  locale: ReturnType<typeof getDateFnsLocale>
): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, "d MMM yyyy, HH:mm", { locale });
}

export function ChoreTaskCard({
  task,
  profile,
  members,
  userId,
  onEdit,
  onChanged,
}: ChoreTaskCardProps) {
  const t = useT();
  const { lang } = useLang();
  const locale = getDateFnsLocale(lang);
  const isFamily = profile?.account_mode === ACCOUNT_MODE.FAMILY && !!profile.family_id;
  const isOwner = task.created_by === userId;
  const isCompleted = task.status === CHORE_STATUS.COMPLETED;
  const creator = resolveCreatorName(task.created_by, userId, profile, members);
  const overdue = isChoreOverdue(task) && !isCompleted;
  const dueDateLabel = formatDueDateLabel(task.due_date, locale);
  const completedAtLabel = formatCompletedAtLabel(task.completed_at, locale);
  const assigneeLabel = resolveChoreAssigneeName(
    task.assigned_to,
    profile,
    members,
    t.chores.assigneeUnassigned
  );

  const [deleteState, deleteAction, deletePending] = useActionState(deleteChoreTask, null);
  const [statusState, statusAction, statusPending] = useActionState(setChoreTaskStatus, null);

  useActionFeedback(deleteState, () => {
    onChanged?.();
  }, deletePending);

  useActionFeedback(statusState, () => {
    onChanged?.();
  }, statusPending);

  return (
    <Card
      className={cn(
        "rounded-none py-0 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden",
        overdue && "border-destructive/50",
        isCompleted &&
          "border-primary/60 bg-primary/8 shadow-md ring-1 ring-primary/20"
      )}
    >
      {isCompleted && (
        <div className="flex items-center gap-2.5 border-b border-primary/25 bg-secondary px-4 py-3 text-secondary-foreground">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-none bg-primary text-primary-foreground">
            <CircleCheck className="size-5" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold tracking-tight">
              {t.chores.completedHighlight}
            </p>
            {completedAtLabel && (
              <p className="text-xs font-medium text-muted-foreground">
                {t.chores.completedAtDisplay}: {completedAtLabel}
              </p>
            )}
          </div>
        </div>
      )}
      <CardHeader
        className={cn(
          "border-b border-border pt-4 pb-3",
          isCompleted && "border-primary/20 bg-primary/5"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle
              className={cn(
                "font-heading text-base truncate",
                isCompleted &&
                  "text-foreground/80 line-through decoration-primary/50 decoration-2"
              )}
            >
              {task.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {isFamily && (
                <span className="inline-flex items-center gap-1">
                  <User className="size-3 shrink-0" />
                  {assigneeLabel}
                </span>
              )}
              {dueDateLabel && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 shrink-0" />
                  {dueDateLabel}
                </span>
              )}
            </div>
          </div>
          {isOwner && (
            <div className="flex shrink-0 gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={onEdit}
                aria-label={t.chores.editBtn}
              >
                <Pencil className="size-4" />
              </Button>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={task.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  disabled={deletePending}
                  className="cursor-pointer text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent
        className={cn("p-4 space-y-3", isCompleted && "bg-primary/5")}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-none border px-2.5 py-1 text-xs font-semibold",
              statusStyles[task.status],
              isCompleted && "border-primary/30 bg-primary text-primary-foreground"
            )}
          >
            {isCompleted && <CircleCheck className="size-3.5" strokeWidth={2.5} />}
            {t.chores.statusLabels[task.status]}
          </span>

          {task.recurrence !== CHORE_RECURRENCE.NONE && (
            <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <RefreshCw className="size-3" />
              {t.chores.recurrenceLabels[task.recurrence]}
            </span>
          )}

          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-none border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <AlertTriangle className="size-3" />
              {t.chores.overdue}
            </span>
          )}
        </div>

        {task.notes && (
          <p
            className={cn(
              "whitespace-pre-wrap text-sm leading-relaxed border-t border-border pt-3",
              isCompleted
                ? "text-muted-foreground line-through decoration-primary/40"
                : "text-foreground"
            )}
          >
            {task.notes}
          </p>
        )}

        {isOwner && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {CHORE_STATUSES.map((status) => (
              <form key={status} action={statusAction}>
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="status" value={status} />
                <Button
                  type="submit"
                  size="sm"
                  variant={task.status === status ? "default" : "outline"}
                  disabled={statusPending || task.status === status}
                  className="cursor-pointer rounded-none h-7 text-xs"
                >
                  {t.chores.statusLabels[status]}
                </Button>
              </form>
            ))}
          </div>
        )}

        {isFamily && creator && (
          <p className="text-[11px] text-muted-foreground">
            {t.chores.addedBy}: {creator}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
