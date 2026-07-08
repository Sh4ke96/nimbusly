import type { Dict } from "@/lib/i18n/types";
import { getFamilyModuleRoute } from "@/lib/constants/app-modules";
import { resolveGiftRecipientLabel } from "@/lib/gifts/recipients";
import { buildSearchIndex, type SearchIndexInput } from "@/lib/search/global-search";
import {
  readSearchStoresSnapshot,
  type SearchStoresSnapshot,
} from "@/lib/search/search-stores-snapshot";
import { resolvePetName } from "@/lib/pets/filters";
import { formatScheduleDateRangeLabel } from "@/lib/schedule/types";
import { getDisplayName } from "@/lib/profile";

export function buildSearchIndexInput(
  moduleLabels: Dict["dashboard"]["moduleLabels"],
  moduleDescs: Dict["dashboard"]["moduleDescs"],
  snapshot: SearchStoresSnapshot
): SearchIndexInput {
  const listNameById = Object.fromEntries(
    snapshot.shoppingLists.map((list) => [list.id, list.name])
  );
  const budgetNameById = Object.fromEntries(
    snapshot.budgets.map((budget) => [budget.id, budget.name])
  );

  return {
    moduleLabels,
    moduleDescs,
    familyHref: getFamilyModuleRoute(),
    budgets: snapshot.budgets.map((budget) => ({
      id: budget.id,
      name: budget.name,
    })),
    budgetEntries: Object.entries(snapshot.expensesByBudgetId).flatMap(
      ([budgetId, entries]) =>
        entries.map((entry) => ({
          id: entry.id,
          budgetId,
          budgetName: budgetNameById[budgetId] ?? "",
          description: entry.description,
          category: entry.category,
          entryType: entry.entry_type,
        }))
    ),
    shoppingLists: snapshot.shoppingLists.map((list) => ({
      id: list.id,
      name: list.name,
    })),
    shoppingItems: Object.entries(snapshot.itemsByListId).flatMap(([listId, items]) =>
      items.map((item) => ({
        id: item.id,
        listId,
        content: item.content,
        listName: listNameById[listId] ?? "",
      }))
    ),
    gifts: snapshot.gifts.map((idea) => ({
      id: idea.id,
      content: idea.content,
      recipientLabel: resolveGiftRecipientLabel(idea, snapshot.members),
      recipientName: idea.recipient_name,
    })),
    birthdays: snapshot.birthdays.map((entry) => ({
      id: entry.id,
      personName: entry.person_name,
    })),
    scheduleEntries: snapshot.scheduleEntries.map((entry) => ({
      id: entry.id,
      title: entry.description,
      dateLabel: formatScheduleDateRangeLabel(
        entry.entry_date,
        entry.entry_end_date,
        " – "
      ),
    })),
    medicineItems: snapshot.medicineItems.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      notes: item.notes,
    })),
    watchlistItems: snapshot.watchlistItems.map((item) => ({
      id: item.id,
      title: item.title,
    })),
    restaurants: snapshot.restaurants.map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      notes: place.notes,
      comment: place.comment,
    })),
    pets: snapshot.pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
    })),
    petCareItems: snapshot.petCareItems.map((care) => ({
      id: care.id,
      name: care.name,
      petName: resolvePetName(snapshot.pets, care.pet_id),
    })),
    chores: snapshot.chores.map((task) => ({
      id: task.id,
      title: task.title,
      notes: task.notes,
    })),
    notes: snapshot.notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
    })),
    noteCategories: snapshot.noteCategories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    familyMembers: snapshot.members.map((member) => ({
      id: member.id,
      name: getDisplayName(member),
    })),
  };
}

export function collectSearchIndexInput(
  moduleLabels: Dict["dashboard"]["moduleLabels"],
  moduleDescs: Dict["dashboard"]["moduleDescs"]
): SearchIndexInput {
  return buildSearchIndexInput(
    moduleLabels,
    moduleDescs,
    readSearchStoresSnapshot()
  );
}

export function collectSearchIndex(
  moduleLabels: Dict["dashboard"]["moduleLabels"],
  moduleDescs: Dict["dashboard"]["moduleDescs"]
) {
  return buildSearchIndex(collectSearchIndexInput(moduleLabels, moduleDescs));
}
