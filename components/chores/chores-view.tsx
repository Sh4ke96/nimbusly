"use client";

import { useCallback, useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { ChoreEditDialog } from "@/components/chores/chore-edit-dialog";
import { ChoreFormDialog } from "@/components/chores/chore-form-dialog";
import { ChoresCalendar } from "@/components/chores/chores-calendar";
import { ChoresFilters } from "@/components/chores/chores-filters";
import { ChoreTaskCard } from "@/components/chores/chore-task-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { CHORE_FILTER_ALL } from "@/lib/constants/chores";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import type { ChoreCalendarOccurrence } from "@/lib/chores/calendar";
import { parseChoreDateString } from "@/lib/chores/types";
import type { ChoreTask } from "@/lib/chores/types";
import {
  filterChoresByAssignee,
  filterChoresByStatus,
  sortChoresForDisplay,
} from "@/lib/chores/filters";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useChoresStore } from "@/lib/stores/chores-store";

type ChoresViewMode = "list" | "calendar";

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

  const now = new Date();
  const [viewMode, setViewMode] = useState<ChoresViewMode>("list");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(CHORE_FILTER_ALL);
  const [assigneeFilter, setAssigneeFilter] = useState<string>(CHORE_FILTER_ALL);
  const [editingTask, setEditingTask] = useState<ChoreTask | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formInitialDate, setFormInitialDate] = useState<Date | undefined>();

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

  function focusOccurrence(occurrence: ChoreCalendarOccurrence) {
    const parsed = parseChoreDateString(occurrence.date);
    if (!parsed) return;
    setYear(parsed.getFullYear());
    setMonth(parsed.getMonth() + 1);
    setFocusedDay(parsed.getDate());
    setFocusedTaskId(occurrence.taskId);
    const task = tasks.find((item) => item.id === occurrence.taskId);
    if (task) openEdit(task);
  }

  function openEdit(task: ChoreTask) {
    setEditingTask(task);
    setEditOpen(true);
  }

  function openFormForDay(day: number) {
    setFormInitialDate(new Date(year, month - 1, day));
    setFormOpen(true);
  }

  function handleFormOpenChange(next: boolean) {
    setFormOpen(next);
    if (!next) setFormInitialDate(undefined);
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
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.CHORES_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">
              {t.chores.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.chores.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.CHORES_VIEW_TOGGLE}
              visible={!loading}
            >
              <div className="inline-flex rounded-none border border-border">
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className="cursor-pointer rounded-none h-8 gap-1.5"
                  onClick={() => setViewMode("list")}
                >
                  <List className="size-3.5" />
                  {t.chores.viewList}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  className="cursor-pointer rounded-none h-8 gap-1.5"
                  onClick={() => setViewMode("calendar")}
                >
                  <LayoutGrid className="size-3.5" />
                  {t.chores.viewCalendar}
                </Button>
              </div>
            </NimbusTourToolbarAnchor>
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.CHORES_FILTERS}
              visible={!loading && tasks.length > 0}
            >
              <ChoresFilters
                tasks={tasks}
                members={members}
                isFamily={isFamily}
                statusFilter={statusFilter}
                assigneeFilter={assigneeFilter}
                onStatusChange={setStatusFilter}
                onAssigneeChange={setAssigneeFilter}
              />
            </NimbusTourToolbarAnchor>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.CHORES_ADD}>
              <ChoreFormDialog
                onSuccess={onTasksChanged}
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                initialDueDate={formInitialDate}
                onTriggerClick={() => setFormInitialDate(undefined)}
              />
            </div>
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchTasks(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full rounded-none" />
            <Skeleton className="h-44 w-full rounded-none" />
          </div>
        ) : filteredTasks.length === 0 && viewMode === "list" ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {tasks.length === 0
              ? t.chores.empty
              : hasActiveFilter
                ? t.chores.emptyFiltered
                : t.chores.empty}
          </p>
        ) : viewMode === "calendar" ? (
          <Card
            id="chores-calendar"
            className="rounded-none py-0 shadow-sm scroll-mt-24"
            data-nimbus-tour={NIMBUS_TOUR_TARGET.CHORES_LIST}
          >
            <CardContent className="p-4 md:p-6">
              <ChoresCalendar
                year={year}
                month={month}
                tasks={filteredTasks}
                profile={profile}
                userId={user?.id}
                focusedDay={focusedDay}
                focusedTaskId={focusedTaskId}
                onMonthChange={(y, m) => {
                  setYear(y);
                  setMonth(m);
                  setFocusedDay(null);
                  setFocusedTaskId(null);
                }}
                onOccurrenceSelect={focusOccurrence}
                onDayClick={openFormForDay}
                onChanged={onTasksChanged}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.CHORES_LIST}>
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
