import type { User } from "@supabase/supabase-js";
import type { Budget, BudgetExpense } from "@/lib/budget/types";
import type { BirthdayEntry } from "@/lib/birthdays/types";
import type { ChoreTask } from "@/lib/chores/types";
import type { GiftIdea } from "@/lib/gifts/types";
import type { MedicineItem } from "@/lib/medicine/types";
import type { Note, NoteCategory } from "@/lib/notes/types";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import type { ScheduleEntry } from "@/lib/schedule/types";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import type { WatchlistItem } from "@/lib/watchlist/types";
import type { Family, FamilyInvitation, FamilyMember, Profile } from "@/lib/profile";

export interface DashboardSnapshot {
  user: User;
  profile: Profile;
  family: Family | null;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  budgets: Budget[];
  expensesByBudgetId: Record<string, BudgetExpense[]>;
  memberIdsByBudgetId: Record<string, string[]>;
  shoppingLists: ShoppingList[];
  gifts: GiftIdea[];
  medicineItems: MedicineItem[];
  watchlistItems: WatchlistItem[];
  restaurantPlaces: RestaurantPlace[];
  pets: Pet[];
  petCareItems: PetCareItem[];
  chores: ChoreTask[];
  notes: Note[];
  noteCategories: NoteCategory[];
  scheduleEntries: ScheduleEntry[];
  birthdays: BirthdayEntry[];
}
