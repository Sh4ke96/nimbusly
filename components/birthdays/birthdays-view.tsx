"use client";

import { useActionState, useCallback, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { ModulePageHeader, ModulePageShell } from "@/components/app/module-page-shell";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { BirthdayCalendar } from "@/components/birthdays/birthday-calendar";
import { BirthdayEditDialog } from "@/components/birthdays/birthday-edit-dialog";
import { BirthdayFormDialog } from "@/components/birthdays/birthday-form-dialog";
import { BirthdaysList } from "@/components/birthdays/birthdays-list";
import { BirthdaysMobileAccordion } from "@/components/birthdays/birthdays-mobile-accordion";
import { Card, CardContent, CardHeader, CardTitle, CARD_TITLE_ROW_CLASSNAME } from "@/components/ui/card";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useBirthdaysStore } from "@/lib/stores/birthdays-store";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { deleteBirthday } from "@/app/(app)/birthdays/actions";

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

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

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

  const onRealtimeChange = useCallback(() => {
    void fetchEntries(true);
  }, [fetchEntries]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "birthday-entries",
    table: "birthday_entries",
    onChange: onRealtimeChange,
  });

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

  function editBirthdayFromCalendar(entry: BirthdayEntry) {
    focusBirthday(entry);
    openEdit(entry);
  }

  function openFormForDay(day: number) {
    setFormInitialDate(new Date(year, month - 1, day));
    setFormOpen(true);
  }

  function handleFormOpenChange(next: boolean) {
    setFormOpen(next);
    if (!next) setFormInitialDate(undefined);
  }

  const listProps = {
    entries: upcoming,
    loading,
    loaded,
    focusedEntryId,
    userId: user?.id,
    deleteAction,
    deletePending,
    onFocus: focusBirthday,
    onEdit: openEdit,
    onAdd: () => setFormOpen(true),
  };

  return (
    <>
      <ModulePageShell width="full">
        <ModulePageHeader
          title={t.birthdays.title}
          subtitle={t.birthdays.subtitle}
          moduleId={APP_MODULE.BIRTHDAYS}
          breadcrumb={t.birthdays.title}
          tourTarget={NIMBUS_TOUR_TARGET.BIRTHDAYS_HEADER}
          actions={
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.BIRTHDAYS_ADD}>
              <BirthdayFormDialog
                onSuccess={onBirthdayChanged}
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                initialDate={formInitialDate}
                onTriggerClick={() => setFormInitialDate(undefined)}
              />
            </div>
          }
        />

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchEntries(true)} />
        ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <BirthdaysMobileAccordion
            {...listProps}
            tourTarget={NIMBUS_TOUR_TARGET.BIRTHDAYS_LIST}
          />

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
                  onEntryEdit={editBirthdayFromCalendar}
                  onDayClick={openFormForDay}
                />
              )}
            </CardContent>
          </Card>

          <Card
            className="hidden rounded-none py-0 shadow-sm h-fit gap-0 lg:block"
            data-nimbus-tour={NIMBUS_TOUR_TARGET.BIRTHDAYS_LIST}
          >
            <CardHeader>
              <CardTitle className={CARD_TITLE_ROW_CLASSNAME}>{t.birthdays.listTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <BirthdaysList {...listProps} />
            </CardContent>
          </Card>
        </div>
        )}
      </ModulePageShell>

      <BirthdayEditDialog
        entry={editingEntry}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onBirthdayChanged}
      />
    </>
  );
}
