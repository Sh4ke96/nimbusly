"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { BirthdayCalendar } from "@/components/birthdays/birthday-calendar";
import { BirthdayFormDialog } from "@/components/birthdays/birthday-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { createClient } from "@/lib/supabase/client";
import { formatBirthdayLabel, type BirthdayEntry } from "@/lib/birthdays/types";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { deleteBirthday } from "@/app/(app)/birthdays/actions";
import { Trash2 } from "lucide-react";

export function BirthdaysView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BirthdayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteBirthday, null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("birthday_entries")
      .select("*")
      .order("birth_month")
      .order("birth_day");

    setEntries((data ?? []) as BirthdayEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useActionFeedback(deleteState, () => {
    void loadEntries();
    void fetchNotifications();
  });

  const onBirthdayCreated = () => {
    void loadEntries();
    void fetchNotifications();
  };

  const upcoming = [...entries].sort((a, b) => {
    if (a.birth_month !== b.birth_month) return a.birth_month - b.birth_month;
    return a.birth_day - b.birth_day;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.birthdays.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.birthdays.title}</h1>
            <p className="text-sm text-muted-foreground">{t.birthdays.subtitle}</p>
          </div>
          <BirthdayFormDialog onSuccess={onBirthdayCreated} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Card className="rounded-none py-0 shadow-sm">
            <CardContent className="p-4 md:p-6">
              {loading ? (
                <Skeleton className="h-[28rem] w-full rounded-none" />
              ) : (
                <BirthdayCalendar
                  year={year}
                  month={month}
                  entries={entries}
                  profile={profile}
                  members={members}
                  userId={user?.id}
                  onMonthChange={(y, m) => {
                    setYear(y);
                    setMonth(m);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none py-0 shadow-sm h-fit">
            <CardHeader className="border-b border-border pt-4">
              <CardTitle className="font-heading text-base">{t.birthdays.listTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full rounded-none" />
                  <Skeleton className="h-10 w-full rounded-none" />
                </div>
              ) : upcoming.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t.birthdays.empty}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{entry.person_name}</p>
                        <p className="text-xs text-muted-foreground">{formatBirthdayLabel(entry)}</p>
                        {entry.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      {entry.created_by === user?.id && (
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={entry.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            disabled={deletePending}
                            className="text-destructive hover:text-destructive shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
