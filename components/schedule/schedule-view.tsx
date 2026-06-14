"use client";

import { SCHEDULE_FORM_FIELD } from "@/lib/schedule/types";
import { useActionState, useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar";
import { ScheduleEditDialog } from "@/components/schedule/schedule-edit-dialog";
import { ScheduleFormDialog } from "@/components/schedule/schedule-form-dialog";
import { ScheduleTypeBadge } from "@/components/schedule/schedule-type-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang, useT } from "@/lib/lang-context";
import { formatMessage } from "@/lib/i18n/format";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import {
  formatScheduleDateLabel,
  parseEntryDateParts,
  type ScheduleEntry,
} from "@/lib/schedule/types";
import { getDisplayName } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { deleteScheduleEntry } from "@/app/(app)/schedule/actions";
import { getMonthName } from "@/lib/birthdays/calendar";
import { buildSchedulePrintHtml, openSchedulePrintWindow } from "@/lib/schedule/print-document";
import { Printer, Pencil, Trash2 } from "lucide-react";

function entryInMonth(entry: ScheduleEntry, year: number, month: number): boolean {
  const parts = parseEntryDateParts(entry.entry_date);
  return parts.year === year && parts.month === month;
}

export function ScheduleView() {
  const t = useT();
  const { lang } = useLang();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const entries = useScheduleStore((s) => s.entries);
  const loaded = useScheduleStore((s) => s.loaded);
  const loading = useScheduleStore((s) => s.loading);
  const error = useScheduleStore((s) => s.error);
  const fetchEntries = useScheduleStore((s) => s.fetchEntries);

  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteScheduleEntry, null);

  useStoreBootstrap(loaded, error, fetchEntries);
  const onScheduleChanged = useModuleRefresh(fetchEntries);

  useActionFeedback(deleteState, onScheduleChanged, deletePending);

  const monthEntries = useMemo(
    () =>
      [...entries]
        .filter((e) => entryInMonth(e, year, month))
        .sort((a, b) => a.entry_date.localeCompare(b.entry_date)),
    [entries, year, month]
  );

  function focusEntry(entry: ScheduleEntry) {
    const parts = parseEntryDateParts(entry.entry_date);
    setYear(parts.year);
    setMonth(parts.month);
    setFocusedDay(parts.day);
    setFocusedEntryId(entry.id);
    document.getElementById("schedule-calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openEdit(entry: ScheduleEntry) {
    setEditingEntry(entry);
    setEditOpen(true);
  }

  function handlePrint() {
    const html = buildSchedulePrintHtml({
      year,
      month,
      entries,
      lang,
      labels: {
        title: t.schedule.title,
        subtitle: printTitle,
        weekdays: t.schedule.calendarWeekdays,
        typeLabels: t.schedule.typeLabels,
      },
    });
    openSchedulePrintWindow(html);
  }

  function resolveCreatorName(createdBy: string): string | null {
    if (!user) return null;
    if (createdBy === user.id && profile) return getDisplayName(profile);
    const member = members.find((m) => m.id === createdBy);
    return member ? getDisplayName(member) : null;
  }

  const printTitle = formatMessage(t.schedule.printTitle, {
    month: getMonthName(month, t.schedule.calendarMonths),
    year: String(year),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="no-print">
        <AppHeader />
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-6">
        <div className="no-print">
          <AccountBreadcrumbs current={t.schedule.title} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.schedule.title}</h1>
            <p className="text-sm text-muted-foreground">{t.schedule.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer className="size-4" />
              {t.schedule.printBtn}
            </Button>
            <ScheduleFormDialog entries={entries} onSuccess={onScheduleChanged} />
          </div>
        </div>

        {error ? (
          <ModuleFetchError onRetry={() => void fetchEntries(true)} />
        ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card id="schedule-calendar" className="rounded-none py-0 shadow-sm scroll-mt-24">
            <CardContent className="p-4 md:p-6">
              {loading && !loaded ? (
                <Skeleton className="h-112 w-full rounded-none no-print" />
              ) : (
                <ScheduleCalendar
                  year={year}
                  month={month}
                  entries={entries}
                  profile={profile}
                  members={members}
                  userId={user?.id}
                  focusedDay={focusedDay}
                  focusedEntryId={focusedEntryId}
                  onMonthChange={(y, m) => {
                    setYear(y);
                    setMonth(m);
                    setFocusedDay(null);
                    setFocusedEntryId(null);
                  }}
                  onEntrySelect={focusEntry}
                />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none py-0 shadow-sm h-fit gap-0 no-print">
            <CardHeader className="border-b border-border pt-4">
              <CardTitle className="font-heading text-base">{t.schedule.listTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading && !loaded ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full rounded-none" />
                  <Skeleton className="h-10 w-full rounded-none" />
                </div>
              ) : monthEntries.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t.schedule.empty}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {monthEntries.map((entry) => {
                    const isSelected = focusedEntryId === entry.id;
                    const isOwner = entry.created_by === user?.id;
                    const creator = resolveCreatorName(entry.created_by);

                    return (
                      <li
                        key={entry.id}
                        className={cn(
                          "flex items-start gap-2 p-3 transition-colors",
                          isSelected && "bg-primary/4"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => focusEntry(entry)}
                          className={cn(
                            "min-w-0 flex-1 cursor-pointer rounded-sm border-l-2 text-left transition-all duration-150",
                            "hover:bg-muted/60 -my-1 py-2 pl-3 pr-2",
                            isSelected
                              ? "border-l-primary bg-primary/6 shadow-sm ring-1 ring-primary/15"
                              : "border-l-transparent"
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <ScheduleTypeBadge type={entry.entry_type} />
                            <span className="text-xs text-muted-foreground">
                              {formatScheduleDateLabel(entry.entry_date)}
                            </span>
                          </div>
                          {entry.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                          {creator && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {t.schedule.addedBy}: {creator}
                            </p>
                          )}
                        </button>
                        {isOwner && (
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
                              onClick={() => openEdit(entry)}
                              aria-label={t.schedule.editBtn}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <form action={deleteAction} onClick={(e) => e.stopPropagation()}>
                              <input type="hidden" name={SCHEDULE_FORM_FIELD.ID} value={entry.id} />
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
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        )}
      </main>

      <ScheduleEditDialog
        entry={editingEntry}
        entries={entries}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onScheduleChanged}
      />
    </div>
  );
}
