"use client";

import {
  BarChart3,
  Cake,
  CalendarDays,
  Clapperboard,
  Cross,
  UtensilsCrossed,
  Gift,
  ListChecks,
  PawPrint,
  StickyNote,
  Scale,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MemberAvatar } from "@/components/member-avatar";
import { RestaurantStarRating } from "@/components/restaurants/restaurant-star-rating";
import { BigStat, EmptyHint, StatTile } from "@/components/dashboard/overview-cards/primitives";
import { overviewAccentStyles } from "@/components/dashboard/sortable-overview-card";
import { formatBirthdayLabel, type BirthdayEntry } from "@/lib/birthdays/types";
import { daysUntilBirthday } from "@/lib/dashboard/birthdays";
import {
  daysUntilExpiry,
  formatMedicineExpiryCountdown,
  getMedicineExpiryStatus,
} from "@/lib/medicine/expiry";
import { formatBudgetAmount } from "@/lib/budget/aggregates";
import { MEDICINE_EXPIRY_STATUS } from "@/lib/constants/medicine";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_OVERVIEW_CARD, type DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import { getAppModuleOverviewMeta } from "@/lib/constants/app-modules";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import type { Lang } from "@/lib/constants/lang";
import { type ScheduleEntryType } from "@/lib/constants/schedule";
import { getScheduleEntryIcon } from "@/lib/schedule/entry-icons";
import { getScheduleTypeLabel } from "@/lib/schedule/types";
import { formatMessage } from "@/lib/i18n/format";
import type { Dict } from "@/lib/i18n/types";
import { getDisplayName, type Family, type FamilyMember, type Profile } from "@/lib/profile";
import type { GiftIdea } from "@/lib/gifts/types";
import type { Note } from "@/lib/notes/types";
import type { MedicineItem } from "@/lib/medicine/types";
import type { ShoppingList } from "@/lib/shopping-lists/types";
import type { WatchlistItem } from "@/lib/watchlist/types";
import type { RestaurantPlace } from "@/lib/restaurants/types";
import type { Pet, PetCareItem } from "@/lib/pets/types";
import type { PetCarePreviewRow } from "@/lib/pets/dashboard";
import type { ChoreTask } from "@/lib/chores/types";
import { formatPetDueCountdown } from "@/lib/pets/due";
import type { ScheduleEntry } from "@/lib/schedule/types";
import type { OverviewAccent } from "@/lib/constants/overview-accent";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function overviewAccent(cardId: DashboardOverviewCardId): OverviewAccent {
  return getAppModuleOverviewMeta(cardId).overviewAccent;
}

function OverviewAccentIcon({
  accent,
  icon: Icon,
}: {
  accent: OverviewAccent;
  icon: LucideIcon;
}) {
  const styles = overviewAccentStyles[accent];
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-none",
        styles.icon
      )}
    >
      <Icon className="size-3.5" />
    </span>
  );
}

function OverviewAccentHint({
  accent,
  children,
  className,
}: {
  accent: OverviewAccent;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs font-medium", overviewAccentStyles[accent].badge, className)}>
      {children}
    </p>
  );
}

const BudgetOverviewMiniChart = dynamic(
  () =>
    import("@/components/dashboard/budget-overview-mini-chart").then(
      (m) => m.BudgetOverviewMiniChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-28 w-full rounded-none" />,
  }
);

export {
  getOverviewCardMeta,
  type OverviewCardMeta,
} from "@/components/dashboard/overview-cards/card-meta";

export interface OverviewCardBodiesProps {
  cardId: DashboardOverviewCardId;
  cardLoading?: boolean;
  cardError?: boolean;
  onCardRetry?: () => void;
  t: Dict;
  lang: Lang;
  profile: Profile | null;
  members: FamilyMember[];
  family: Family | null;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  budgetChartData: { key: string; name: string; total: number; fill: string }[];
  lists: ShoppingList[];
  previewLists: ShoppingList[];
  gifts: GiftIdea[];
  previewGifts: GiftIdea[];
  medicineItems: MedicineItem[];
  previewMedicines: MedicineItem[];
  expiringMedicinesCount: number;
  watchlistItems: WatchlistItem[];
  previewWatchlistItems: WatchlistItem[];
  toWatchCount: number;
  restaurantPlaces: RestaurantPlace[];
  previewRestaurantPlaces: RestaurantPlace[];
  plannedRestaurantCount: number;
  pets: Pet[];
  careItems: PetCareItem[];
  duePetCareCount: number;
  previewDuePetCare: PetCarePreviewRow[];
  activeChoreCount: number;
  overdueChoreCount: number;
  previewChoreTasks: ChoreTask[];
  notes: Note[];
  previewNotes: Note[];
  upcomingBirthdays: BirthdayEntry[];
  monthScheduleEntries: ScheduleEntry[];
  scheduleByType: [string, number][];
}

export function OverviewCardBody({
  cardId,
  cardLoading = false,
  cardError = false,
  onCardRetry,
  t,
  lang,
  profile,
  members,
  family,
  incomeTotal,
  expenseTotal,
  balance,
  budgetChartData,
  lists,
  previewLists,
  gifts,
  previewGifts,
  medicineItems,
  previewMedicines,
  expiringMedicinesCount,
  watchlistItems,
  previewWatchlistItems,
  toWatchCount,
  restaurantPlaces,
  previewRestaurantPlaces,
  plannedRestaurantCount,
  pets,
  duePetCareCount,
  previewDuePetCare,
  activeChoreCount,
  overdueChoreCount,
  previewChoreTasks,
  notes,
  previewNotes,
  upcomingBirthdays,
  monthScheduleEntries,
  scheduleByType,
}: OverviewCardBodiesProps) {
  if (cardError) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-xs text-muted-foreground max-w-xs">{t.module.fetchError}</p>
        {onCardRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onCardRetry();
            }}
          >
            {t.module.retry}
          </Button>
        )}
      </div>
    );
  }

  if (cardLoading) {
    return <Skeleton className="h-32 w-full rounded-none" />;
  }

  switch (cardId) {
    case DASHBOARD_OVERVIEW_CARD.BUDGET:
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider">
            <BarChart3 className="size-3.5 text-primary" />
            {t.dashboard.budgetThisMonth}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatTile
              label={t.budget.incomeLabel}
              value={formatBudgetAmount(incomeTotal, lang)}
              icon={TrendingUp}
              tone="income"
            />
            <StatTile
              label={t.budget.expensesLabel}
              value={formatBudgetAmount(expenseTotal, lang)}
              icon={TrendingDown}
              tone="expense"
            />
            <StatTile
              label={t.budget.balanceLabel}
              value={formatBudgetAmount(balance, lang)}
              icon={Scale}
            />
          </div>
          {budgetChartData.length > 0 ? (
            <BudgetOverviewMiniChart data={budgetChartData} lang={lang} t={t} />
          ) : (
            <EmptyHint icon={Wallet} text={t.dashboard.noData} />
          )}
        </div>
      );

    case DASHBOARD_OVERVIEW_CARD.SHOPPING: {
      const accent = overviewAccent(cardId);
      return lists.length === 0 ? (
        <EmptyHint icon={ListChecks} text={t.dashboard.shoppingListsEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={lists.length}
            label={formatMessage(t.dashboard.shoppingListsCount, {
              count: String(lists.length),
            })}
            accent={accent}
          />
          <ul className="space-y-1.5">
            {previewLists.map((list) => (
              <li
                key={list.id}
                className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
              >
                <OverviewAccentIcon accent={accent} icon={ListChecks} />
                <span className="truncate font-medium">{list.name}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.GIFTS: {
      const accent = overviewAccent(cardId);
      return gifts.length === 0 ? (
        <EmptyHint icon={Gift} text={t.dashboard.giftsEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={gifts.length}
            label={formatMessage(t.dashboard.giftsCount, {
              count: String(gifts.length),
            })}
            accent={accent}
          />
          <ul className="space-y-1.5">
            {previewGifts.map((idea) => (
              <li
                key={idea.id}
                className="text-sm border border-border bg-muted/20 px-2.5 py-2 line-clamp-2"
              >
                {idea.content.trim()}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET: {
      const accent = overviewAccent(cardId);
      return medicineItems.length === 0 ? (
        <EmptyHint icon={Cross} text={t.dashboard.medicineItemsEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={medicineItems.length}
            label={formatMessage(t.dashboard.medicineItemsCount, {
              count: String(medicineItems.length),
            })}
            accent={accent}
          />
          {expiringMedicinesCount > 0 ? (
            <>
              <OverviewAccentHint accent={accent}>
                {formatMessage(t.dashboard.medicineExpiringCount, {
                  count: String(expiringMedicinesCount),
                })}
              </OverviewAccentHint>
              <ul className="space-y-1.5">
                {previewMedicines.map((item) => {
                  if (!item.expiry_date) {
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                      >
                        <OverviewAccentIcon accent={accent} icon={Cross} />
                        <span className="truncate font-medium">{item.name}</span>
                      </li>
                    );
                  }

                  const days = daysUntilExpiry(item.expiry_date);
                  const status = getMedicineExpiryStatus(item.expiry_date);
                  const whenLabel = formatMedicineExpiryCountdown(
                    item.expiry_date,
                    t.medicineCabinet
                  );

                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                    >
                      <OverviewAccentIcon accent={accent} icon={Cross} />
                      <span className="truncate font-medium flex-1 min-w-0">{item.name}</span>
                      {whenLabel && (
                        <span
                          className={cn(
                            "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 border rounded-none",
                            status === MEDICINE_EXPIRY_STATUS.EXPIRED
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : days === 0
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25"
                                : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                          )}
                        >
                          {whenLabel}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.WATCHLIST: {
      const accent = overviewAccent(cardId);
      return watchlistItems.length === 0 ? (
        <EmptyHint icon={Clapperboard} text={t.dashboard.watchlistItemsEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={watchlistItems.length}
            label={formatMessage(t.dashboard.watchlistItemsCount, {
              count: String(watchlistItems.length),
            })}
            accent={accent}
          />
          {toWatchCount > 0 && (
            <>
              <OverviewAccentHint accent={accent}>
                {formatMessage(t.dashboard.watchlistToWatchCount, {
                  count: String(toWatchCount),
                })}
              </OverviewAccentHint>
              <ul className="space-y-1.5">
                {previewWatchlistItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                  >
                    <OverviewAccentIcon accent={accent} icon={Clapperboard} />
                    <span className="truncate font-medium flex-1 min-w-0">{item.title}</span>
                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground uppercase">
                      {t.watchlist.statusLabels[item.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.RESTAURANTS: {
      const accent = overviewAccent(cardId);
      return restaurantPlaces.length === 0 ? (
        <EmptyHint icon={UtensilsCrossed} text={t.dashboard.restaurantsEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={restaurantPlaces.length}
            label={formatMessage(t.dashboard.restaurantsCount, {
              count: String(restaurantPlaces.length),
            })}
            accent={accent}
          />
          {plannedRestaurantCount > 0 && (
            <OverviewAccentHint accent={accent}>
              {formatMessage(t.dashboard.restaurantsPlannedCount, {
                count: String(plannedRestaurantCount),
              })}
            </OverviewAccentHint>
          )}
          {previewRestaurantPlaces.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {t.dashboard.restaurantsBestRecent}
              </p>
              <ul className="space-y-1.5">
                {previewRestaurantPlaces.map((place) => (
                  <li
                    key={place.id}
                    className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                  >
                    <OverviewAccentIcon accent={accent} icon={UtensilsCrossed} />
                    <span className="truncate font-medium flex-1 min-w-0">{place.name}</span>
                    {place.rating !== null && (
                      <RestaurantStarRating value={place.rating} size="sm" />
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            plannedRestaurantCount === 0 && (
              <EmptyHint icon={UtensilsCrossed} text={t.dashboard.restaurantsNoRatedYet} />
            )
          )}
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.PETS: {
      const accent = overviewAccent(cardId);
      const accentStyles = overviewAccentStyles[accent];
      return pets.length === 0 ? (
        <EmptyHint icon={PawPrint} text={t.dashboard.petsEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={pets.length}
            label={formatMessage(t.dashboard.petsCount, {
              count: String(pets.length),
            })}
            accent={accent}
          />
          {duePetCareCount > 0 && (
            <>
              <OverviewAccentHint accent={accent}>
                {formatMessage(t.dashboard.petsDueCount, {
                  count: String(duePetCareCount),
                })}
              </OverviewAccentHint>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {t.dashboard.petsDueSoonHeading}
              </p>
              <ul className="space-y-1.5">
                {previewDuePetCare.map(({ item, petName }) => {
                  const whenLabel =
                    formatPetDueCountdown(item.next_due_date, t.pets) ?? t.pets.dueSoon;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                    >
                      <OverviewAccentIcon accent={accent} icon={PawPrint} />
                      <span className="truncate font-medium flex-1 min-w-0">
                        {petName ? `${petName}: ${item.name}` : item.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 border rounded-none",
                          accentStyles.badge
                        )}
                      >
                        {whenLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.CHORES: {
      const accent = overviewAccent(cardId);
      return activeChoreCount === 0 ? (
        <EmptyHint icon={ListChecks} text={t.dashboard.choresEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={activeChoreCount}
            label={formatMessage(t.dashboard.choresCount, {
              count: String(activeChoreCount),
            })}
            accent={accent}
          />
          {overdueChoreCount > 0 && (
            <p className="text-xs text-destructive font-medium">
              {formatMessage(t.dashboard.choresOverdueCount, {
                count: String(overdueChoreCount),
              })}
            </p>
          )}
          {previewChoreTasks.length > 0 && (
            <ul className="space-y-1.5">
              {previewChoreTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
                >
                  <OverviewAccentIcon accent={accent} icon={ListChecks} />
                  <span className="truncate font-medium flex-1 min-w-0">{task.title}</span>
                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground uppercase">
                    {t.chores.statusLabels[task.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.NOTES: {
      const accent = overviewAccent(cardId);
      return notes.length === 0 ? (
        <EmptyHint icon={StickyNote} text={t.dashboard.notesEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={notes.length}
            label={formatMessage(t.dashboard.notesCount, {
              count: String(notes.length),
            })}
            accent={accent}
          />
          <ul className="space-y-1.5">
            {previewNotes.map((note) => (
              <li
                key={note.id}
                className="text-sm border border-border bg-muted/20 px-2.5 py-2 line-clamp-2"
              >
                {note.title}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.BIRTHDAYS: {
      const accent = overviewAccent(cardId);
      const accentStyles = overviewAccentStyles[accent];
      return upcomingBirthdays.length === 0 ? (
        <EmptyHint icon={Cake} text={t.dashboard.birthdaysEmpty} />
      ) : (
        <ul className="space-y-2">
          {upcomingBirthdays.map((entry) => {
            const days = daysUntilBirthday(entry.birth_month, entry.birth_day);
            const whenLabel =
              days === 0
                ? t.dashboard.birthdayToday
                : formatMessage(t.dashboard.birthdayInDays, {
                  count: String(days),
                });

            return (
              <li
                key={entry.id}
                className="flex items-center gap-3 border border-border bg-muted/20 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-none",
                    accentStyles.icon
                  )}
                >
                  <Cake className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{entry.person_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBirthdayLabel(entry)}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 border rounded-none",
                    days === 0
                      ? accentStyles.badge
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {whenLabel}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.CALENDAR: {
      const accent = overviewAccent(cardId);
      const accentStyles = overviewAccentStyles[accent];
      return monthScheduleEntries.length === 0 ? (
        <EmptyHint icon={CalendarDays} text={t.dashboard.scheduleEmpty} />
      ) : (
        <div className="space-y-3">
          <BigStat
            value={monthScheduleEntries.length}
            label={formatMessage(t.dashboard.scheduleThisMonth, {
              count: String(monthScheduleEntries.length),
            })}
            accent={accent}
          />
          <ul className="space-y-1.5">
            {scheduleByType.slice(0, 4).map(([type, count]) => {
              const ScheduleIcon = getScheduleEntryIcon(type as ScheduleEntryType);
              return (
              <li
                key={type}
                className="flex items-center justify-between gap-2 text-sm border border-border bg-muted/20 px-2.5 py-2"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
                    <ScheduleIcon className="size-3.5" aria-hidden />
                  </span>
                  <span className="truncate">
                    {getScheduleTypeLabel(
                      type as ScheduleEntryType,
                      t.schedule.typeLabels
                    )}
                  </span>
                </span>
                <span className={cn("font-heading font-semibold shrink-0", accentStyles.badge)}>
                  {count}
                </span>
              </li>
            );
            })}
          </ul>
        </div>
      );
    }

    case DASHBOARD_OVERVIEW_CARD.FAMILY:
      return profile?.account_mode === ACCOUNT_MODE.FAMILY && members.length > 0 ? (
        <div className="space-y-3">
          {family?.name && (
            <div className="flex items-center gap-2 border border-border bg-primary/5 px-3 py-2">
              <Users className="size-4 text-primary shrink-0" />
              <p className="font-heading font-semibold text-sm">{family.name}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {formatMessage(t.dashboard.familyMembers, {
              count: String(members.length),
            })}
          </p>
          <ul className="space-y-2">
            {members.slice(0, 4).map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2.5 text-sm border border-border bg-muted/20 px-2.5 py-2"
              >
                <MemberAvatar
                  name={getDisplayName(member)}
                  color={member.avatar_color}
                  size="sm"
                />
                <span className="truncate font-medium">{getDisplayName(member)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-none bg-muted text-muted-foreground">
            <User className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">{t.dashboard.familySolo}</p>
        </div>
      );
  }
}
