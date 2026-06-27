"use client";

import { useCallback, useMemo, useState } from "react";
import { useStoreBootstrap } from "@/lib/hooks/use-store-bootstrap";
import { useModuleRefresh } from "@/lib/hooks/use-module-refresh";
import { useScopedRealtime } from "@/lib/hooks/use-scoped-realtime";
import { AppHeader } from "@/components/app/app-header";
import { AppPage } from "@/components/app/app-page";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { GiftEditDialog } from "@/components/gifts/gift-edit-dialog";
import { GiftFormDialog } from "@/components/gifts/gift-form-dialog";
import { GiftsFilters } from "@/components/gifts/gifts-filters";
import { GiftNoteCard } from "@/components/gifts/gift-note-card";
import { NimbusTourToolbarAnchor } from "@/components/nimbus/nimbus-tour-toolbar-anchor";
import { FamilyRealtimeHint } from "@/components/ui/family-realtime-hint";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { Skeleton } from "@/components/ui/skeleton";
import { GIFT_FILTER_ALL } from "@/lib/constants/gifts";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { countActiveFilters } from "@/lib/filters/active-count";
import { filterGiftIdeasByRecipient } from "@/lib/gifts/recipients";
import type { GiftIdea } from "@/lib/gifts/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";

export function GiftsView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const ideas = useGiftsStore((s) => s.ideas);
  const loaded = useGiftsStore((s) => s.loaded);
  const loading = useGiftsStore((s) => s.loading);
  const error = useGiftsStore((s) => s.error);
  const fetchIdeas = useGiftsStore((s) => s.fetchIdeas);

  const familyId =
    profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
      ? profile.family_id
      : null;

  const [filterKey, setFilterKey] = useState<string>(GIFT_FILTER_ALL);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [editingIdea, setEditingIdea] = useState<GiftIdea | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useStoreBootstrap(loaded, error, fetchIdeas);
  const onGiftsChanged = useModuleRefresh(fetchIdeas);

  const onRealtimeChange = useCallback(() => {
    void fetchIdeas(true);
  }, [fetchIdeas]);

  useScopedRealtime({
    userId: user?.id,
    familyId,
    channelKey: "gift-ideas",
    table: "gift_ideas",
    onChange: onRealtimeChange,
  });

  const filteredIdeas = useMemo(
    () => filterGiftIdeasByRecipient(ideas, filterKey),
    [ideas, filterKey]
  );

  function openEdit(idea: GiftIdea) {
    setEditingIdea(idea);
    setEditOpen(true);
  }

  const hasActiveFilter = countActiveFilters([filterKey], GIFT_FILTER_ALL) > 0;

  return (
    <div className="flex flex-col md:min-h-screen">
      <AppHeader />

      <AppPage width="default">
        <AccountBreadcrumbs current={t.gifts.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1" data-nimbus-tour={NIMBUS_TOUR_TARGET.GIFTS_HEADER}>
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.gifts.title}</h1>
            <p className="text-sm text-muted-foreground">{t.gifts.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <NimbusTourToolbarAnchor
              tourTarget={NIMBUS_TOUR_TARGET.GIFTS_FILTERS}
              visible={!loading && ideas.length > 0}
            >
              <GiftsFilters
                ideas={ideas}
                members={members}
                value={filterKey}
                onChange={setFilterKey}
              />
            </NimbusTourToolbarAnchor>
            <div data-nimbus-tour={NIMBUS_TOUR_TARGET.GIFTS_ADD}>
              <GiftFormDialog onSuccess={onGiftsChanged} />
            </div>
          </div>
        </div>

        {familyId ? <FamilyRealtimeHint /> : null}

        {error ? (
          <ModuleFetchError onRetry={() => void fetchIdeas(true)} />
        ) : loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full rounded-none" />
            <Skeleton className="h-40 w-full rounded-none" />
          </div>
        ) : filteredIdeas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {filterKey === GIFT_FILTER_ALL ? t.gifts.empty : hasActiveFilter ? t.gifts.emptyFiltered : t.gifts.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-nimbus-tour={NIMBUS_TOUR_TARGET.GIFTS_LIST}>
            {filteredIdeas.map((idea) => (
              <GiftNoteCard
                key={idea.id}
                idea={idea}
                profile={profile}
                members={members}
                userId={user?.id}
                selected={focusedId === idea.id}
                onSelect={() => setFocusedId(idea.id)}
                onEdit={() => openEdit(idea)}
                onDeleted={onGiftsChanged}
              />
            ))}
          </div>
        )}
      </AppPage>

      <GiftEditDialog
        idea={editingIdea}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onGiftsChanged}
      />
    </div>
  );
}
