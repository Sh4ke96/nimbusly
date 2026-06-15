"use client";

import { Button } from "@/components/ui/button";
import { DASHBOARD_OVERVIEW_CARD, type DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import { NIMBUS_TOUR_TARGET } from "@/lib/constants/nimbus-tour";
import { useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";
import { LayoutGrid, Check } from "lucide-react";

function getOverviewCardLabel(
  cardId: DashboardOverviewCardId,
  labels: {
    budget: string;
    shopping: string;
    gifts: string;
    medicineCabinet: string;
    watchlist: string;
    restaurants: string;
    pets: string;
    chores: string;
    notes: string;
    birthdays: string;
    calendar: string;
    family: string;
  }
): string {
  switch (cardId) {
    case DASHBOARD_OVERVIEW_CARD.BUDGET:
      return labels.budget;
    case DASHBOARD_OVERVIEW_CARD.SHOPPING:
      return labels.shopping;
    case DASHBOARD_OVERVIEW_CARD.GIFTS:
      return labels.gifts;
    case DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET:
      return labels.medicineCabinet;
    case DASHBOARD_OVERVIEW_CARD.WATCHLIST:
      return labels.watchlist;
    case DASHBOARD_OVERVIEW_CARD.RESTAURANTS:
      return labels.restaurants;
    case DASHBOARD_OVERVIEW_CARD.PETS:
      return labels.pets;
    case DASHBOARD_OVERVIEW_CARD.CHORES:
      return labels.chores;
    case DASHBOARD_OVERVIEW_CARD.NOTES:
      return labels.notes;
    case DASHBOARD_OVERVIEW_CARD.BIRTHDAYS:
      return labels.birthdays;
    case DASHBOARD_OVERVIEW_CARD.CALENDAR:
      return labels.calendar;
    case DASHBOARD_OVERVIEW_CARD.FAMILY:
      return labels.family;
  }
}

interface DashboardOverviewControlsProps {
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
  hiddenCardIds: DashboardOverviewCardId[];
  onShowCard: (cardId: DashboardOverviewCardId) => void;
  saving?: boolean;
}

export function DashboardOverviewControls({
  editMode,
  onEditModeChange,
  hiddenCardIds,
  onShowCard,
  saving = false,
}: DashboardOverviewControlsProps) {
  const t = useT();

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
        data-nimbus-tour={NIMBUS_TOUR_TARGET.DASHBOARD_LAYOUT_EDIT}
      >
        <Button
          type="button"
          variant={editMode ? "default" : "outline"}
          size="sm"
          className="cursor-pointer rounded-none"
          disabled={saving}
          onClick={() => onEditModeChange(!editMode)}
        >
          {editMode ? (
            <>
              <Check className="size-4" />
              {t.dashboard.customizeOverviewDoneBtn}
            </>
          ) : (
            <>
              <LayoutGrid className="size-4" />
              {t.dashboard.customizeOverviewBtn}
            </>
          )}
        </Button>
      </div>

      {editMode && (
        <p className="text-xs text-muted-foreground border border-dashed border-border bg-muted/20 px-3 py-2">
          {t.dashboard.customizeOverviewHint}
        </p>
      )}

      {hiddenCardIds.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 text-xs",
            editMode ? "opacity-100" : "opacity-80"
          )}
        >
          <span className="font-medium text-muted-foreground">
            {t.dashboard.hiddenOverviewCardsLabel}
          </span>
          {hiddenCardIds.map((cardId) => (
            <Button
              key={cardId}
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer rounded-none h-7 px-2 text-xs"
              disabled={!editMode || saving}
              onClick={() => onShowCard(cardId)}
            >
              {getOverviewCardLabel(cardId, t.dashboard.moduleLabels)}
              <span className="ml-1 text-primary">{t.dashboard.showOverviewCardBtn}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
