import {
  DASHBOARD_OVERVIEW_CARDS,
  DEFAULT_DASHBOARD_OVERVIEW_ORDER,
  isDashboardOverviewCardId,
  type DashboardOverviewCardId,
} from "@/lib/constants/dashboard-overview";
import { normalizeAppModuleId } from "@/lib/constants/app-modules";

export interface DashboardOverviewLayout {
  order: DashboardOverviewCardId[];
  hidden: DashboardOverviewCardId[];
  attentionPinned?: string[];
}

const EMPTY_LAYOUT: DashboardOverviewLayout = {
  order: [...DEFAULT_DASHBOARD_OVERVIEW_ORDER],
  hidden: [],
  attentionPinned: [],
};

function uniqueValidCardIds(values: unknown): DashboardOverviewCardId[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<DashboardOverviewCardId>();
  const result: DashboardOverviewCardId[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    const cardId = normalizeAppModuleId(value);
    if (!cardId || !isDashboardOverviewCardId(cardId) || seen.has(cardId)) continue;
    seen.add(cardId);
    result.push(cardId);
  }

  return result;
}

function uniquePinKeys(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    const pinKey = value.trim();
    if (!pinKey || seen.has(pinKey)) continue;
    seen.add(pinKey);
    result.push(pinKey);
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
    attentionPinned: uniquePinKeys(layout.attentionPinned),
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
    attentionPinned: uniquePinKeys(record.attentionPinned),
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
    attentionPinned: normalized.attentionPinned,
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
    attentionPinned: normalized.attentionPinned,
  });
}

export function toggleAttentionItemPin(
  layout: DashboardOverviewLayout,
  pinKey: string
): DashboardOverviewLayout {
  const normalized = normalizeDashboardOverviewLayout(layout);
  const pinned = [...(normalized.attentionPinned ?? [])];
  const index = pinned.indexOf(pinKey);

  if (index >= 0) {
    pinned.splice(index, 1);
  } else {
    pinned.unshift(pinKey);
  }

  return normalizeDashboardOverviewLayout({
    ...normalized,
    attentionPinned: pinned,
  });
}

export function serializeDashboardOverviewLayout(layout: DashboardOverviewLayout): string {
  const normalized = normalizeDashboardOverviewLayout(layout);
  return JSON.stringify(normalized);
}
