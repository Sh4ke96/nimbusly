import {
  APP_MODULE_IDS,
  APP_MODULE_ROUTES,
  getAppModuleLabel,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import type { Dict } from "@/lib/i18n/types";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  moduleId: AppModuleId | "item";
  kind: "module" | "item";
}

export interface SearchIndexInput {
  moduleLabels: Dict["dashboard"]["moduleLabels"];
  budgets: { id: string; name: string }[];
  shoppingLists: { id: string; name: string }[];
  shoppingItems: { id: string; listId: string; content: string; listName: string }[];
  gifts: { id: string; content: string; recipientLabel: string }[];
  birthdays: { id: string; personName: string }[];
  scheduleEntries: { id: string; title: string; dateLabel: string }[];
  medicineItems: { id: string; name: string }[];
  watchlistItems: { id: string; title: string }[];
  restaurants: { id: string; name: string }[];
  pets: { id: string; name: string }[];
  chores: { id: string; title: string }[];
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function buildSearchIndex(input: SearchIndexInput): SearchResult[] {
  const results: SearchResult[] = APP_MODULE_IDS.map((moduleId) => ({
    id: `module:${moduleId}`,
    title: getAppModuleLabel(moduleId, input.moduleLabels),
    href: APP_MODULE_ROUTES[moduleId],
    moduleId,
    kind: "module",
  }));

  for (const budget of input.budgets) {
    results.push({
      id: `budget:${budget.id}`,
      title: budget.name,
      subtitle: input.moduleLabels.budget,
      href: "/budget",
      moduleId: "budget",
      kind: "item",
    });
  }

  for (const list of input.shoppingLists) {
    results.push({
      id: `shopping-list:${list.id}`,
      title: list.name,
      subtitle: input.moduleLabels.shopping,
      href: "/shopping",
      moduleId: "shopping",
      kind: "item",
    });
  }

  for (const item of input.shoppingItems) {
    results.push({
      id: `shopping-item:${item.id}`,
      title: item.content,
      subtitle: `${input.moduleLabels.shopping} · ${item.listName}`,
      href: "/shopping",
      moduleId: "shopping",
      kind: "item",
    });
  }

  for (const gift of input.gifts) {
    results.push({
      id: `gift:${gift.id}`,
      title: gift.content,
      subtitle: `${input.moduleLabels.gifts} · ${gift.recipientLabel}`,
      href: "/gifts",
      moduleId: "gifts",
      kind: "item",
    });
  }

  for (const birthday of input.birthdays) {
    results.push({
      id: `birthday:${birthday.id}`,
      title: birthday.personName,
      subtitle: input.moduleLabels.birthdays,
      href: "/birthdays",
      moduleId: "birthdays",
      kind: "item",
    });
  }

  for (const entry of input.scheduleEntries) {
    results.push({
      id: `schedule:${entry.id}`,
      title: entry.title,
      subtitle: `${input.moduleLabels.calendar} · ${entry.dateLabel}`,
      href: "/schedule",
      moduleId: "calendar",
      kind: "item",
    });
  }

  for (const item of input.medicineItems) {
    results.push({
      id: `medicine:${item.id}`,
      title: item.name,
      subtitle: input.moduleLabels.medicineCabinet,
      href: "/medicine-cabinet",
      moduleId: "medicineCabinet",
      kind: "item",
    });
  }

  for (const item of input.watchlistItems) {
    results.push({
      id: `watchlist:${item.id}`,
      title: item.title,
      subtitle: input.moduleLabels.watchlist,
      href: "/watchlist",
      moduleId: "watchlist",
      kind: "item",
    });
  }

  for (const place of input.restaurants) {
    results.push({
      id: `restaurant:${place.id}`,
      title: place.name,
      subtitle: input.moduleLabels.restaurants,
      href: "/restaurants",
      moduleId: "restaurants",
      kind: "item",
    });
  }

  for (const pet of input.pets) {
    results.push({
      id: `pet:${pet.id}`,
      title: pet.name,
      subtitle: input.moduleLabels.pets,
      href: "/pets",
      moduleId: "pets",
      kind: "item",
    });
  }

  for (const chore of input.chores) {
    results.push({
      id: `chore:${chore.id}`,
      title: chore.title,
      subtitle: input.moduleLabels.chores,
      href: "/chores",
      moduleId: "chores",
      kind: "item",
    });
  }

  return results;
}

export function filterSearchResults(
  index: SearchResult[],
  query: string,
  limit = 24
): SearchResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return index.filter((item) => item.kind === "module").slice(0, limit);
  }

  const matches = index.filter((item) => {
    const haystack = `${item.title} ${item.subtitle ?? ""}`.toLowerCase();
    return haystack.includes(normalized);
  });

  const modules = matches.filter((item) => item.kind === "module");
  const items = matches.filter((item) => item.kind === "item");
  return [...modules, ...items].slice(0, limit);
}
