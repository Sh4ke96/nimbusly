"use client";

import { useActionState, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { BirthdayCalendar } from "@/components/birthdays/birthday-calendar";
import { BirthdayEditDialog } from "@/components/birthdays/birthday-edit-dialog";
import { BirthdayFormDialog } from "@/components/birthdays/birthday-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CARD_TITLE_ROW_CLASSNAME } from "@/components/ui/card";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { formatBirthdayLabel, type BirthdayEntry, BIRTHDAY_FORM_FIELD } from "@/lib/birthdays/types";
import { selectionListRowClasses } from "@/lib/ui/selection-styles";
import { cn } from "@/lib/utils";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { deleteBirthday } from "@/app/(app)/birthdays/actions";
import { Pencil, Trash2 } from "lucide-react";

export function BirthdaysView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const entries = useBirthdaysStore((s) => s.entries);
  const loaded = useBirthdaysStore((s) => s.loaded);
  const loading = useBirthdaysStore((s) => s.loading);
  const error = useBirthdaysStore((s) => s.error);
  const fetchEntries = useBirthdaysStore((s) => s.fetchEntries);

  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<BirthdayEntry | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formInitialDate, setFormInitialDate] = useState<Date | undefined>();
  const [deleteState, deleteAction, deletePending] = useActionState(deleteBirthday, null);

  useStoreBootstrap(loaded, error, fetchEntries);
  const onBirthdayChanged = useModuleRefresh(fetchEntries);

  useActionFeedback(deleteState, onBirthdayChanged, deletePending);

  const upcoming = [...entries].sort((a, b) => {
    if (a.birth_month !== b.birth_month) return a.birth_month - b.birth_month;
    return a.birth_day - b.birth_day;
  });

  function focusBirthday(entry: BirthdayEntry) {
    setYear(now.getFullYear());
    setMonth(entry.birth_month);
    setFocusedDay(entry.birth_day);
    setFocusedEntryId(entry.id);
    document.getElementById("birthday-calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openEdit(entry: BirthdayEntry) {
    setEditingEntry(entry);
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

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.birthdays.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.BIRTHDAYS_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.birthdays.title}</h1>
            <p className="text-sm text-muted-foreground">{t.birthdays.subtitle}</p>
          </div>
          <div data-nimbus-tour={NIMBUS_TOUR_TARGET.BIRTHDAYS_ADD}>
            <BirthdayFormDialog
              onSuccess={onBirthdayChanged}
              open={formOpen}
              onOpenChange={handleFormOpenChange}
              initialDate={formInitialDate}
              onTriggerClick={() => setFormInitialDate(undefined)}
            />
          </div>
        </div>

        {error ? (
          <ModuleFetchError onRetry={() => void fetchEntries(true)} />
        ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card
            id="birthday-calendar"
            className="rounded-none py-0 shadow-sm scroll-mt-24"
            data-nimbus-tour={NIMBUS_TOUR_TARGET.BIRTHDAYS_CALENDAR}
          >
            <CardContent className="p-4 md:p-6">
              {loading && !loaded ? (
                <Skeleton className="h-112 w-full rounded-none" />
              ) : (
                <BirthdayCalendar
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
                  onEntrySelect={focusBirthday}
                  onDayClick={openFormForDay}
                />
              )}
            </CardContent>
          </Card>

          <Card
            className="rounded-none py-0 shadow-sm h-fit gap-0"
            data-nimbus-tour={NIMBUS_TOUR_TARGET.BIRTHDAYS_LIST}
          >
            <CardHeader>
              <CardTitle className={CARD_TITLE_ROW_CLASSNAME}>{t.birthdays.listTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading && !loaded ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full rounded-none" />
                  <Skeleton className="h-10 w-full rounded-none" />
                </div>
              ) : upcoming.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t.birthdays.empty}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((entry) => {
                    const isSelected = focusedEntryId === entry.id;
                    const isOwner = entry.created_by === user?.id;

                    return (
                      <li
                        key={entry.id}
                        className="flex items-start gap-2 p-3 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => focusBirthday(entry)}
                          className={cn(
                            "min-w-0 flex-1 cursor-pointer rounded-sm border-l-2 text-left transition-all duration-150",
                            "hover:bg-muted/60 -my-1 py-2 pl-3 pr-2",
                            selectionListRowClasses(isSelected)
                          )}
                        >
                          <p className="font-medium text-sm truncate">{entry.person_name}</p>
                          <p className="text-xs text-muted-foreground">{formatBirthdayLabel(entry)}</p>
                          {entry.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {entry.description}
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
                              aria-label={t.birthdays.editBtn}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <form action={deleteAction} onClick={(e) => e.stopPropagation()}>
                              <input type="hidden" name={BIRTHDAY_FORM_FIELD.ID} value={entry.id} />
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

      <BirthdayEditDialog
        entry={editingEntry}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onBirthdayChanged}
      />
    </div>
  );
}
