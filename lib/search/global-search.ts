import {
  APP_MODULE,
  APP_MODULE_IDS,
  APP_MODULE_ROUTES,
  getAppModuleDesc,
  getAppModuleLabel,
  type AppModuleId,
} from "@/lib/constants/app-modules";
import type { Dict } from "@/lib/i18n/types";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  href: string;
  moduleId: AppModuleId | "item";
  kind: "module" | "item";
}

export interface SearchIndexInput {
  moduleLabels: Dict["dashboard"]["moduleLabels"];
  moduleDescs: Dict["dashboard"]["moduleDescs"];
  familyHref: string;
  budgets: { id: string; name: string }[];
  budgetEntries: {
    id: string;
    budgetId: string;
    budgetName: string;
    description: string;
    category: string;
    entryType: string;
  }[];
  shoppingLists: { id: string; name: string }[];
  shoppingItems: { id: string; listId: string; content: string; listName: string }[];
  gifts: {
    id: string;
    content: string;
    recipientLabel: string;
    recipientName: string;
  }[];
  birthdays: { id: string; personName: string }[];
  scheduleEntries: { id: string; title: string; dateLabel: string }[];
  medicineItems: { id: string; name: string; location: string; notes: string }[];
  watchlistItems: { id: string; title: string }[];
  restaurants: {
    id: string;
    name: string;
    address: string;
    notes: string;
    comment: string;
  }[];
  pets: { id: string; name: string }[];
  petCareItems: { id: string; name: string; petName: string }[];
  chores: { id: string; title: string; notes: string }[];
  notes: { id: string; title: string; content: string }[];
  noteCategories: { id: string; name: string }[];
  familyMembers: { id: string; name: string }[];
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function searchHaystack(item: Pick<SearchResult, "title" | "subtitle" | "keywords">): string {
  return `${item.title} ${item.subtitle ?? ""} ${item.keywords ?? ""}`.toLowerCase();
}

export function buildSearchIndex(input: SearchIndexInput): SearchResult[] {
  const results: SearchResult[] = APP_MODULE_IDS.map((moduleId) => ({
    id: `module:${moduleId}`,
    title: getAppModuleLabel(moduleId, input.moduleLabels),
    subtitle: getAppModuleDesc(moduleId, input.moduleDescs),
    href: moduleId === APP_MODULE.FAMILY ? input.familyHref : APP_MODULE_ROUTES[moduleId],
    moduleId,
    kind: "module",
  }));

  for (const budget of input.budgets) {
    results.push({
      id: `budget:${budget.id}`,
      title: budget.name,
      subtitle: input.moduleLabels.budget,
      href: APP_MODULE_ROUTES[APP_MODULE.BUDGET],
      moduleId: APP_MODULE.BUDGET,
      kind: "item",
    });
  }

  for (const entry of input.budgetEntries) {
    const title = entry.description.trim() || entry.category;
    results.push({
      id: `budget-entry:${entry.id}`,
      title,
      subtitle: `${input.moduleLabels.budget} · ${entry.budgetName}`,
      keywords: `${entry.category} ${entry.entryType}`,
      href: APP_MODULE_ROUTES[APP_MODULE.BUDGET],
      moduleId: APP_MODULE.BUDGET,
      kind: "item",
    });
  }

  for (const list of input.shoppingLists) {
    results.push({
      id: `shopping-list:${list.id}`,
      title: list.name,
      subtitle: input.moduleLabels.shopping,
      href: APP_MODULE_ROUTES[APP_MODULE.SHOPPING],
      moduleId: APP_MODULE.SHOPPING,
      kind: "item",
    });
  }

  for (const item of input.shoppingItems) {
    results.push({
      id: `shopping-item:${item.id}`,
      title: item.content,
      subtitle: `${input.moduleLabels.shopping} · ${item.listName}`,
      href: APP_MODULE_ROUTES[APP_MODULE.SHOPPING],
      moduleId: APP_MODULE.SHOPPING,
      kind: "item",
    });
  }

  for (const gift of input.gifts) {
    results.push({
      id: `gift:${gift.id}`,
      title: gift.content,
      subtitle: `${input.moduleLabels.gifts} · ${gift.recipientLabel}`,
      keywords: gift.recipientName,
      href: APP_MODULE_ROUTES[APP_MODULE.GIFTS],
      moduleId: APP_MODULE.GIFTS,
      kind: "item",
    });
  }

  for (const birthday of input.birthdays) {
    results.push({
      id: `birthday:${birthday.id}`,
      title: birthday.personName,
      subtitle: input.moduleLabels.birthdays,
      href: APP_MODULE_ROUTES[APP_MODULE.BIRTHDAYS],
      moduleId: APP_MODULE.BIRTHDAYS,
      kind: "item",
    });
  }

  for (const entry of input.scheduleEntries) {
    results.push({
      id: `schedule:${entry.id}`,
      title: entry.title,
      subtitle: `${input.moduleLabels.calendar} · ${entry.dateLabel}`,
      href: APP_MODULE_ROUTES[APP_MODULE.CALENDAR],
      moduleId: APP_MODULE.CALENDAR,
      kind: "item",
    });
  }

  for (const item of input.medicineItems) {
    results.push({
      id: `medicine:${item.id}`,
      title: item.name,
      subtitle: input.moduleLabels.medicineCabinet,
      keywords: `${item.location} ${item.notes}`,
      href: APP_MODULE_ROUTES[APP_MODULE.MEDICINE_CABINET],
      moduleId: APP_MODULE.MEDICINE_CABINET,
      kind: "item",
    });
  }

  for (const item of input.watchlistItems) {
    results.push({
      id: `watchlist:${item.id}`,
      title: item.title,
      subtitle: input.moduleLabels.watchlist,
      href: APP_MODULE_ROUTES[APP_MODULE.WATCHLIST],
      moduleId: APP_MODULE.WATCHLIST,
      kind: "item",
    });
  }

  for (const place of input.restaurants) {
    results.push({
      id: `restaurant:${place.id}`,
      title: place.name,
      subtitle: input.moduleLabels.restaurants,
      keywords: `${place.address} ${place.notes} ${place.comment}`,
      href: APP_MODULE_ROUTES[APP_MODULE.RESTAURANTS],
      moduleId: APP_MODULE.RESTAURANTS,
      kind: "item",
    });
  }

  for (const pet of input.pets) {
    results.push({
      id: `pet:${pet.id}`,
      title: pet.name,
      subtitle: input.moduleLabels.pets,
      href: APP_MODULE_ROUTES[APP_MODULE.PETS],
      moduleId: APP_MODULE.PETS,
      kind: "item",
    });
  }

  for (const care of input.petCareItems) {
    results.push({
      id: `pet-care:${care.id}`,
      title: care.name,
      subtitle: `${input.moduleLabels.pets} · ${care.petName}`,
      href: APP_MODULE_ROUTES[APP_MODULE.PETS],
      moduleId: APP_MODULE.PETS,
      kind: "item",
    });
  }

  for (const chore of input.chores) {
    results.push({
      id: `chore:${chore.id}`,
      title: chore.title,
      subtitle: input.moduleLabels.chores,
      keywords: chore.notes,
      href: APP_MODULE_ROUTES[APP_MODULE.CHORES],
      moduleId: APP_MODULE.CHORES,
      kind: "item",
    });
  }

  for (const note of input.notes) {
    results.push({
      id: `note:${note.id}`,
      title: note.title,
      subtitle: input.moduleLabels.notes,
      keywords: note.content,
      href: APP_MODULE_ROUTES[APP_MODULE.NOTES],
      moduleId: APP_MODULE.NOTES,
      kind: "item",
    });
  }

  for (const category of input.noteCategories) {
    results.push({
      id: `note-category:${category.id}`,
      title: category.name,
      subtitle: input.moduleLabels.notes,
      href: APP_MODULE_ROUTES[APP_MODULE.NOTES],
      moduleId: APP_MODULE.NOTES,
      kind: "item",
    });
  }

  for (const member of input.familyMembers) {
    results.push({
      id: `family-member:${member.id}`,
      title: member.name,
      subtitle: input.moduleLabels.family,
      href: input.familyHref,
      moduleId: APP_MODULE.FAMILY,
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

  const matches = index.filter((item) => searchHaystack(item).includes(normalized));

  const modules = matches.filter((item) => item.kind === "module");
  const items = matches.filter((item) => item.kind === "item");
  return [...modules, ...items].slice(0, limit);
}
