"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AccountBreadcrumbs } from "@/components/app/account-breadcrumbs";
import { GiftEditDialog } from "@/components/gifts/gift-edit-dialog";
import { GiftFormDialog } from "@/components/gifts/gift-form-dialog";
import { GiftNoteCard } from "@/components/gifts/gift-note-card";
import { GiftRecipientFilter } from "@/components/gifts/gift-recipient-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { GIFT_FILTER_ALL } from "@/lib/constants/gifts";
import { filterGiftIdeasByRecipient } from "@/lib/gifts/recipients";
import type { GiftIdea } from "@/lib/gifts/types";
import { useT } from "@/lib/lang-context";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useGiftsStore } from "@/lib/stores/gifts-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";

export function GiftsView() {
  const t = useT();
  const user = useProfileStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const members = useProfileStore((s) => s.members);
  const ideas = useGiftsStore((s) => s.ideas);
  const loaded = useGiftsStore((s) => s.loaded);
  const loading = useGiftsStore((s) => s.loading);
  const fetchIdeas = useGiftsStore((s) => s.fetchIdeas);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);

  const [filterKey, setFilterKey] = useState<string>(GIFT_FILTER_ALL);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [editingIdea, setEditingIdea] = useState<GiftIdea | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!loaded) void fetchIdeas();
  }, [loaded, fetchIdeas]);

  const filteredIdeas = useMemo(
    () => filterGiftIdeasByRecipient(ideas, filterKey),
    [ideas, filterKey]
  );

  const onGiftsChanged = () => {
    void fetchIdeas(true);
    void fetchNotifications(true);
  };

  function openEdit(idea: GiftIdea) {
    setEditingIdea(idea);
    setEditOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <AccountBreadcrumbs current={t.gifts.title} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading font-bold text-2xl tracking-tight">{t.gifts.title}</h1>
            <p className="text-sm text-muted-foreground">{t.gifts.subtitle}</p>
          </div>
          <GiftFormDialog onSuccess={onGiftsChanged} />
        </div>

        {!loading && ideas.length > 0 && (
          <GiftRecipientFilter
            ideas={ideas}
            members={members}
            value={filterKey}
            onChange={setFilterKey}
          />
        )}

        {loading && !loaded ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40 w-full rounded-none" />
            <Skeleton className="h-40 w-full rounded-none" />
          </div>
        ) : filteredIdeas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border">
            {filterKey === GIFT_FILTER_ALL ? t.gifts.empty : t.gifts.emptyFiltered}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
      </main>

      <GiftEditDialog
        idea={editingIdea}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onGiftsChanged}
      />
    </div>
  );
}
