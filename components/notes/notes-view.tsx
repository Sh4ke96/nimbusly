"use client";

import { useCallback, useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { NoteEditDialog } from "@/components/notes/note-edit-dialog";
import { NoteFormDialog } from "@/components/notes/note-form-dialog";
import { NoteCategoryFormDialog } from "@/components/notes/note-category-form-dialog";
import { NoteCategoriesPanel } from "@/components/notes/note-categories-panel";
import { NotesFilters } from "@/components/notes/notes-filters";
import { NoteCard } from "@/components/notes/note-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { NOTE_FILTER_ALL } from "@/lib/notes/types";
import { filterNotesByCategory } from "@/lib/notes/types";
import type { Note } from "@/lib/notes/types";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { countActiveFilters } from "@/lib/filters/active-count";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useNotesStore } from "@/lib/stores/notes-store";

export function NotesView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const notes = useNotesStore((s) => s.notes);
  const categories = useNotesStore((s) => s.categories);
  const loaded = useNotesStore((s) => s.loaded);
  const loading = useNotesStore((s) => s.loading);
  const error = useNotesStore((s) => s.error);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const [filterKey, setFilterKey] = useState<string>(NOTE_FILTER_ALL);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchNotes);
  const onNotesChanged = useModuleRefresh(fetchNotes);

  const onRealtimeChange = useCallback(() => {
    void fetchNotes(true);
  }, [fetchNotes]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "notes",
    table: "notes",
    onChange: onRealtimeChange,
  });

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "note-categories",
    table: "note_categories",
    onChange: onRealtimeChange,
  });

  const filteredNotes = useMemo(
    () => filterNotesByCategory(notes, filterKey),
    [notes, filterKey]
  );

  function openEdit(note: Note) {
    setEditingNote(note);
    setEditOpen(true);
  }

  const hasActiveFilter = countActiveFilters([filterKey], NOTE_FILTER_ALL) > 0;

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="default">
        <AccountBreadcrumbs current={t.notes.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTES_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.notes.title}</h1>
            <p className="text-sm text-muted-foreground">{t.notes.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.NOTES_FILTERS}
              visible={!loading && (notes.length > 0 || categories.length > 0)}
            >
              <NotesFilters
                notes={notes}
                categories={categories}
                value={filterKey}
                onChange={setFilterKey}
              />
            </NimbusTourToolbarAnchor>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTES_CATEGORY}>
              <NoteCategoryFormDialog onSuccess={onNotesChanged} />
            </div>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTES_ADD}>
              <NoteFormDialog
                categories={categories}
                profile={profile}
                members={members}
                onSuccess={onNotesChanged}
              />
            </div>
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {!loading && categories.length > 0 && (
          <NoteCategoriesPanel
            categories={categories}
            userId={user?.id}
            onChanged={onNotesChanged}
          />
        )}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchNotes(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full rounded-none" />
            <Skeleton className="h-40 w-full rounded-none" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {hasActiveFilter ? t.notes.emptyFiltered : t.notes.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.NOTES_LIST}>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                categories={categories}
                profile={profile}
                members={members}
                userId={user?.id}
                isSelected={focusedId === note.id}
                onSelect={() => setFocusedId(note.id)}
                onEdit={() => openEdit(note)}
                onChanged={onNotesChanged}
              />
            ))}
          </div>
        )}
      </AppPage>

      <NoteEditDialog
        note={editingNote}
        categories={categories}
        profile={profile}
        members={members}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onNotesChanged}
      />
    </div>
  );
}
