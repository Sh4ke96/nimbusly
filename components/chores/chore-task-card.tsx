"use client";

import { CHORE_FORM_FIELD } from "@/lib/chores/types";
import { format } from "date-fns";
import { useActionState, useRef } from "react";
import {
  AlertTriangle,
  Calendar,
  CircleCheck,
  ListTodo,
  Loader2,
  Pencil,
  Trash2,
  UserCheck,
  UserPen,
  type LucideIcon,
} from "lucide-react";
import { resolveChoreAssigneeName } from "@/components/chores/chore-assignee-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardHeaderActionButton, CardHeaderActions, CardTitle, CARD_TITLE_ROW_CLASSNAME } from "@/components/ui/card";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import {
  CHORE_RECURRENCE,
  CHORE_STATUSES,
  CHORE_STATUS,
  type ChoreStatus,
} from "@/lib/constants/chores";
import {
  countChoreSeriesOccurrences,
  normalizeCompletedDates,
  resolveOccurrenceDateToComplete,
} from "@/lib/chores/completion";
import type { ChoreTask } from "@/lib/chores/types";
import { parseChoreDateString } from "@/lib/chores/types";
import { isChoreOverdue } from "@/lib/chores/filters";
import { formatChoreScheduleLabel } from "@/lib/chores/recurrence";
import { ChoreOccurrenceCompleteButton } from "@/components/chores/chore-occurrence-complete-button";
import { formatMessage } from "@/lib/i18n/format";
import { getDateFnsLocale } from "@/lib/i18n/date-fns-locale";
import { useLang, useT } from "@/lib/lang-context";
import { getDisplayName, type FamilyMember, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import {
  deleteChoreTask,
  setChoreTaskStatus,
} from "@/app/(app)/chores/actions";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { useNimbusCelebration } from "@/lib/hooks/use-nimbus-celebration";

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

const statusIcons: Record<ChoreStatus, LucideIcon> = {
  [CHORE_STATUS.PENDING]: ListTodo,
  [CHORE_STATUS.IN_PROGRESS]: Loader2,
  [CHORE_STATUS.COMPLETED]: CircleCheck,
};

function ChoreStatusIcon({
  status,
  className,
}: {
  status: ChoreStatus;
  className?: string;
}) {
  const Icon = statusIcons[status];
  return <Icon className={className} strokeWidth={2.25} aria-hidden />;
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
  const canChangeStatus = isOwner || isFamily;
  const isCompleted = task.status === CHORE_STATUS.COMPLETED;
  const creator = resolveCreatorName(task.created_by, userId, profile, members);
  const overdue = isChoreOverdue(task) && !isCompleted;
  const completedAtLabel = formatCompletedAtLabel(task.completed_at, locale);
  const assigneeLabel = resolveChoreAssigneeName(
    task.assigned_to,
    profile,
    members,
    t.chores.assigneeUnassigned
  );
  const scheduleLabel = formatChoreScheduleLabel(task, t.chores, (iso) => {
    const parsed = parseChoreDateString(iso);
    if (!parsed) return iso;
    return format(parsed, "d MMM yyyy", { locale });
  });
  const isSeries = task.recurrence !== CHORE_RECURRENCE.NONE;
  const occurrenceToComplete = resolveOccurrenceDateToComplete(task);
  const seriesDoneCount = normalizeCompletedDates(task.completed_dates).length;
  const seriesTotal = isSeries ? countChoreSeriesOccurrences(task) : 0;
  const hasMeta =
    !!scheduleLabel ||
    isFamily ||
    (isSeries && seriesTotal > 0) ||
    (isFamily && !!creator);

  const [deleteState, deleteAction, deletePending] = useActionState(deleteChoreTask, null);
  const [statusState, statusAction, statusPending] = useActionState(setChoreTaskStatus, null);
  const pendingStatusRef = useRef<string | null>(null);
  const celebrate = useNimbusCelebration();

  useActionFeedback(deleteState, () => {
    onChanged?.();
  }, deletePending);

  useActionFeedback(statusState, () => {
    if (pendingStatusRef.current === CHORE_STATUS.COMPLETED) {
      celebrate("firstChore");
    }
    pendingStatusRef.current = null;
    onChanged?.();
  }, statusPending);

  return (
    <Card
      className={cn(
        "gap-0 rounded-none py-0 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden",
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
      <CardHeader className={cn(isCompleted && "border-primary/20 bg-primary/5")}>
        <CardTitle
          className={cn(
            CARD_TITLE_ROW_CLASSNAME,
            isCompleted &&
            "text-foreground/80 line-through decoration-primary/50 decoration-2"
          )}
        >
          {task.icon_emoji && (
            <span
              className="inline-flex h-5.5 w-5.5 shrink-0 items-center justify-center text-[1.25rem] leading-none"
              aria-hidden
            >
              {task.icon_emoji}
            </span>
          )}
          <span className="min-w-0 flex-1 wrap-break-word">{task.title}</span>
        </CardTitle>
        {isOwner && (
          <CardHeaderActions>
            <CardHeaderActionButton onClick={onEdit} aria-label={t.chores.editBtn}>
              <Pencil className="size-4" />
            </CardHeaderActionButton>
            <form action={deleteAction} className="border-l border-border">
              <input type="hidden" name={CHORE_FORM_FIELD.ID} value={task.id} />
              <CardHeaderActionButton
                type="submit"
                destructive
                disabled={deletePending}
                aria-label={t.chores.deleteBtn}
              >
                <Trash2 className="size-4" />
              </CardHeaderActionButton>
            </form>
          </CardHeaderActions>
        )}
      </CardHeader>
      <CardContent
        className={cn("flex flex-col gap-4 pb-4 pt-4", isCompleted && "bg-primary/5")}
      >
        {hasMeta && (
          <div className="space-y-2 text-xs text-muted-foreground">
            {scheduleLabel && (
              <div className="flex items-start gap-2">
                <Calendar className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/80" />
                <span className="min-w-0 leading-relaxed">{scheduleLabel}</span>
              </div>
            )}
            {isFamily && (
              <div className="flex items-start gap-2">
                <UserCheck className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/80" />
                <span className="min-w-0 leading-relaxed">{assigneeLabel}</span>
              </div>
            )}
            {isSeries && seriesTotal > 0 && (
              <div className="flex items-start gap-2">
                <ListTodo className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/80" />
                <span className="min-w-0 leading-relaxed">
                  {formatMessage(t.chores.completedDaysProgress, {
                    done: String(seriesDoneCount),
                    total: String(seriesTotal),
                  })}
                </span>
              </div>
            )}
            {isFamily && creator && (
              <div className="flex items-start gap-2">
                <UserPen className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/80" />
                <span className="min-w-0 leading-relaxed text-[11px]">
                  {t.chores.addedBy}: {creator}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            hasMeta && "border-t border-border pt-3"
          )}
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-none border px-3 py-1.5 text-xs font-semibold",
              statusStyles[task.status],
              isCompleted && "border-primary/30 bg-primary text-primary-foreground"
            )}
          >
            <ChoreStatusIcon
              status={task.status}
              className={cn("size-4 shrink-0", isCompleted && "text-primary-foreground")}
            />
            {t.chores.statusLabels[task.status]}
          </span>

          {overdue && (
            <span className="inline-flex items-center gap-1.5 rounded-none border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
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

        {canChangeStatus && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {CHORE_STATUSES.map((status) => {
              if (status === CHORE_STATUS.COMPLETED && occurrenceToComplete) {
                return (
                  <ChoreOccurrenceCompleteButton
                    key={status}
                    taskId={task.id}
                    occurrenceDate={occurrenceToComplete}
                    onSuccess={onChanged}
                  />
                );
              }

              return (
                <form key={status} action={statusAction}>
                  <input type="hidden" name={CHORE_FORM_FIELD.ID} value={task.id} />
                  <input type="hidden" name={CHORE_FORM_FIELD.STATUS} value={status} />
                  <Button
                    type="submit"
                    size="sm"
                    variant={task.status === status ? "default" : "outline"}
                    disabled={statusPending || task.status === status}
                    className="cursor-pointer rounded-none h-8 text-xs gap-1.5 px-2.5"
                    onClick={() => {
                      pendingStatusRef.current = status;
                    }}
                  >
                    <ChoreStatusIcon status={status} className="size-3.5" />
                    {t.chores.statusLabels[status]}
                  </Button>
                </form>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
