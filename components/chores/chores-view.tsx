"use client";

import { useCallback, useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { ChoreAssigneeFilter } from "@/components/chores/chore-assignee-filter";
import { ChoreEditDialog } from "@/components/chores/chore-edit-dialog";
import { ChoreFormDialog } from "@/components/chores/chore-form-dialog";
import { ChoreStatusFilter } from "@/components/chores/chore-status-filter";
import { ChoreTaskCard } from "@/components/chores/chore-task-card";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { CHORE_FILTER_ALL } from "@/lib/constants/chores";
import type { ChoreTask } from "@/lib/chores/types";
import {
  filterChoresByAssignee,
  filterChoresByStatus,
  sortChoresForDisplay,
} from "@/lib/chores/filters";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useChoresStore } from "@/lib/stores/chores-store";

export function ChoresView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const tasks = useChoresStore((s) => s.tasks);
  const loaded = useChoresStore((s) => s.loaded);
  const loading = useChoresStore((s) => s.loading);
  const error = useChoresStore((s) => s.error);
  const fetchTasks = useChoresStore((s) => s.fetchTasks);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;
  const isFamily = !!familyId;

  const [statusFilter, setStatusFilter] = useState<string>(CHORE_FILTER_ALL);
  const [assigneeFilter, setAssigneeFilter] = useState<string>(CHORE_FILTER_ALL);
  const [editingTask, setEditingTask] = useState<ChoreTask | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchTasks);
  const onTasksChanged = useModuleRefresh(fetchTasks);

  const onRealtimeChange = useCallback(() => {
    void fetchTasks(true);
  }, [fetchTasks]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "chore-tasks",
    table: "chore_tasks",
    onChange: onRealtimeChange,
  });

  const filteredTasks = useMemo(() => {
    const byStatus = filterChoresByStatus(tasks, statusFilter);
    const byAssignee = filterChoresByAssignee(byStatus, assigneeFilter);
    return sortChoresForDisplay(byAssignee);
  }, [tasks, statusFilter, assigneeFilter]);

  function openEdit(task: ChoreTask) {
    setEditingTask(task);
    setEditOpen(true);
  }

  const hasActiveFilter =
    statusFilter !== CHORE_FILTER_ALL ||
    (isFamily && assigneeFilter !== CHORE_FILTER_ALL);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.chores.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.chores.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.chores.subtitle}</p>
          </div>
          <ChoreFormDialog onSuccess={onTasksChanged} />
        </div>

        {!loading && tasks.length > 0 && (
          <div className="space-y-3">
            <ChoreStatusFilter
              tasks={tasks}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            {isFamily && (
              <ChoreAssigneeFilter
                tasks={tasks}
                members={members}
                value={assigneeFilter}
                onChange={setAssigneeFilter}
              />
            )}
          </div>
        )}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchTasks(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-none" />
            <Skeleton className="h-44 w-full rounded-none" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {tasks.length === 0
              ? t.chores.empty
              : hasActiveFilter
                ? t.chores.emptyFiltered
                : t.chores.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTasks.map((task) => (
              <ChoreTaskCard
                key={task.id}
                task={task}
                profile={profile}
                members={members}
                userId={user?.id}
                onEdit={() => openEdit(task)}
                onChanged={onTasksChanged}
              />
            ))}
          </div>
        )}
      </main>

      <ChoreEditDialog
        task={editingTask}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onTasksChanged}
      />
    </div>
  );
}
