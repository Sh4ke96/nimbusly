"use client";

import { useCallback, useMemo, useState } from "react";
import { StickyNote } from "lucide-react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { ModulePageHeader, ModulePageShell } from "@/components/app/module-page-shell";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { NoteEditDialog } from "@/components/notes/note-edit-dialog";
import { NoteFormDialog } from "@/components/notes/note-form-dialog";
import { NoteCategoryFormDialog } from "@/components/notes/note-category-form-dialog";
import { NoteCategoriesPanel } from "@/components/notes/note-categories-panel";
import { NotesFilters } from "@/components/notes/notes-filters";
import { NoteCard } from "@/components/notes/note-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { ModuleEmptyState } from "@/components/ui/module-empty-state";
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
  const [formOpen, setFormOpen] = useState<boolean>(false);

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
    <>
      <ModulePageShell>
        <ModulePageHeader
          title={t.notes.title}
          subtitle={t.notes.subtitle}
          moduleId={APP_MODULE.NOTES}
          breadcrumb={t.notes.title}
          tourTarget={NIMBUS_TOUR_TARGET.NOTES_HEADER}
          actions={
            <>
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
                  open={formOpen}
                  onOpenChange={setFormOpen}
                />
              </div>
            </>
          }
        />

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
          <ModuleEmptyState
            icon={StickyNote}
            message={hasActiveFilter ? t.notes.emptyFiltered : t.notes.empty}
            actionLabel={
              hasActiveFilter
                ? t.common.clearFilters
                : notes.length === 0
                  ? t.notes.addBtn
                  : undefined
            }
            onAction={
              hasActiveFilter
                ? () => setFilterKey(NOTE_FILTER_ALL)
                : notes.length === 0
                  ? () => setFormOpen(true)
                  : undefined
            }
          />
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
      </ModulePageShell>

      <NoteEditDialog
        note={editingNote}
        categories={categories}
        profile={profile}
        members={members}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onNotesChanged}
      />
    </>
  );
}
