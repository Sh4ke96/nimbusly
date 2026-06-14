import {
  DASHBOARD_OVERVIEW_CARDS,
  DEFAULT_DASHBOARD_OVERVIEW_ORDER,
  type DashboardOverviewCardId,
} from "@/lib/constants/dashboard-overview";

export interface DashboardOverviewLayout {
  order: DashboardOverviewCardId[];
  hidden: DashboardOverviewCardId[];
}

const EMPTY_LAYOUT: DashboardOverviewLayout = {
  order: [...DEFAULT_DASHBOARD_OVERVIEW_ORDER],
  hidden: [],
};

function isOverviewCardId(value: string): value is DashboardOverviewCardId {
  return (DASHBOARD_OVERVIEW_CARDS as readonly string[]).includes(value);
}

function uniqueValidCardIds(values: unknown): DashboardOverviewCardId[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<DashboardOverviewCardId>();
  const result: DashboardOverviewCardId[] = [];

  for (const value of values) {
    if (typeof value !== "string" || !isOverviewCardId(value) || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }

  return result;
}

export function normalizeDashboardOverviewLayout(
  layout: DashboardOverviewLayout
): DashboardOverviewLayout {
  const order = uniqueValidCardIds(layout.order);
  const hidden = uniqueValidCardIds(layout.hidden);

  for (const cardId of DASHBOARD_OVERVIEW_CARDS) {
    if (!order.includes(cardId)) {
      order.push(cardId);
    }
  }

  const hiddenSet = new Set(hidden.filter((id) => order.includes(id)));
  return {
    order,
    hidden: DASHBOARD_OVERVIEW_CARDS.filter((id) => hiddenSet.has(id)),
  };
}

export function parseDashboardOverviewLayout(raw: unknown): DashboardOverviewLayout {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_LAYOUT };
  }

  const record = raw as Record<string, unknown>;
  return normalizeDashboardOverviewLayout({
    order: uniqueValidCardIds(record.order),
    hidden: uniqueValidCardIds(record.hidden),
  });
}

export function getVisibleOverviewCardIds(
  layout: DashboardOverviewLayout
): DashboardOverviewCardId[] {
  const normalized = normalizeDashboardOverviewLayout(layout);
  const hidden = new Set(normalized.hidden);
  return normalized.order.filter((id) => !hidden.has(id));
}

export function reorderOverviewCards(
  layout: DashboardOverviewLayout,
  activeId: DashboardOverviewCardId,
  overId: DashboardOverviewCardId
): DashboardOverviewLayout {
  const normalized = normalizeDashboardOverviewLayout(layout);
  const visible = getVisibleOverviewCardIds(normalized);
  const oldIndex = visible.indexOf(activeId);
  const newIndex = visible.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
    return normalized;
  }

  const nextVisible = [...visible];
  const [moved] = nextVisible.splice(oldIndex, 1);
  nextVisible.splice(newIndex, 0, moved);

  const hiddenSet = new Set(normalized.hidden);
  const nextOrder: DashboardOverviewCardId[] = [];

  for (const cardId of nextVisible) {
    nextOrder.push(cardId);
  }

  for (const cardId of normalized.order) {
    if (!nextOrder.includes(cardId)) {
      nextOrder.push(cardId);
    }
  }

  return normalizeDashboardOverviewLayout({
    order: nextOrder,
    hidden: [...hiddenSet],
  });
}

export function setOverviewCardHidden(
  layout: DashboardOverviewLayout,
  cardId: DashboardOverviewCardId,
  hidden: boolean
): DashboardOverviewLayout {
  const normalized = normalizeDashboardOverviewLayout(layout);
  const hiddenSet = new Set(normalized.hidden);

  if (hidden) {
    hiddenSet.add(cardId);
  } else {
    hiddenSet.delete(cardId);
  }

  return normalizeDashboardOverviewLayout({
    order: normalized.order,
    hidden: [...hiddenSet],
  });
}

export function serializeDashboardOverviewLayout(layout: DashboardOverviewLayout): string {
  const normalized = normalizeDashboardOverviewLayout(layout);
  return JSON.stringify(normalized);
}
