"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  OverviewCardBody,
  getOverviewCardMeta,
  type OverviewCardBodiesProps,
} from "@/components/dashboard/dashboard-overview-card-bodies";
import { SortableOverviewCard } from "@/components/dashboard/sortable-overview-card";
import type { DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import type { Profile } from "@/lib/profile";
import { useT } from "@/lib/lang-context";

type CardBodiesData = Omit<
  OverviewCardBodiesProps,
  "cardId" | "cardLoading" | "cardError" | "onCardRetry"
>;

export interface DashboardOverviewCardGridProps {
  visibleCardIds: DashboardOverviewCardId[];
  editMode: boolean;
  profile: Profile | null;
  cardLoadingById: Partial<Record<DashboardOverviewCardId, boolean>>;
  cardErrorById: Partial<Record<DashboardOverviewCardId, boolean>>;
  cardRetryById: Partial<Record<DashboardOverviewCardId, () => void>>;
  cardBodiesProps: CardBodiesData;
  onDragEnd: (event: DragEndEvent) => void;
  onHideCard: (cardId: DashboardOverviewCardId) => void;
}

export function DashboardOverviewCardGrid({
  visibleCardIds,
  editMode,
  profile,
  cardLoadingById,
  cardErrorById,
  cardRetryById,
  cardBodiesProps,
  onDragEnd,
  onHideCard,
}: DashboardOverviewCardGridProps) {
  const t = useT();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => onDragEnd(event)}
    >
      <SortableContext items={visibleCardIds} strategy={rectSortingStrategy}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleCardIds.map((cardId) => {
            const meta = getOverviewCardMeta(cardId, t.dashboard, profile);
            return (
              <SortableOverviewCard
                key={cardId}
                cardId={cardId}
                href={meta.href}
                title={meta.title}
                icon={meta.icon}
                accent={meta.accent}
                className={meta.className}
                editMode={editMode}
                onHide={() => onHideCard(cardId)}
              >
                <OverviewCardBody
                  cardId={cardId}
                  cardLoading={cardLoadingById[cardId]}
                  cardError={cardErrorById[cardId]}
                  onCardRetry={cardRetryById[cardId]}
                  {...cardBodiesProps}
                />
              </SortableOverviewCard>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
