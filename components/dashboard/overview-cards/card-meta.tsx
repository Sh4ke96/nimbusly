import {
  Cake,
  CalendarDays,
  Clapperboard,
  Cross,
  Gift,
  ListChecks,
  PawPrint,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { type OverviewAccent } from "@/components/dashboard/sortable-overview-card";
import {
  DASHBOARD_OVERVIEW_CARD,
  type DashboardOverviewCardId,
} from "@/lib/constants/dashboard-overview";
import { ACCOUNT_MODE } from "@/lib/constants/account";
import { SETTINGS_TAB } from "@/lib/constants/settings";
import type { Dict } from "@/lib/i18n/types";
import type { Profile } from "@/lib/profile";

export interface OverviewCardMeta {
  href: string;
  title: string;
  icon: LucideIcon;
  accent: OverviewAccent;
  className?: string;
}

export function getOverviewCardMeta(
  cardId: DashboardOverviewCardId,
  t: Dict["dashboard"],
  profile: Profile | null
): OverviewCardMeta {
  switch (cardId) {
    case DASHBOARD_OVERVIEW_CARD.BUDGET:
      return {
        href: "/budget",
        title: t.moduleLabels.budget,
        icon: Wallet,
        accent: "primary",
        className: "sm:col-span-2 xl:col-span-1",
      };
    case DASHBOARD_OVERVIEW_CARD.SHOPPING:
      return {
        href: "/shopping",
        title: t.moduleLabels.shopping,
        icon: ShoppingCart,
        accent: "orange",
      };
    case DASHBOARD_OVERVIEW_CARD.GIFTS:
      return {
        href: "/gifts",
        title: t.moduleLabels.gifts,
        icon: Gift,
        accent: "violet",
      };
    case DASHBOARD_OVERVIEW_CARD.MEDICINE_CABINET:
      return {
        href: "/medicine-cabinet",
        title: t.moduleLabels.medicineCabinet,
        icon: Cross,
        accent: "emerald",
      };
    case DASHBOARD_OVERVIEW_CARD.WATCHLIST:
      return {
        href: "/watchlist",
        title: t.moduleLabels.watchlist,
        icon: Clapperboard,
        accent: "indigo",
      };
    case DASHBOARD_OVERVIEW_CARD.RESTAURANTS:
      return {
        href: "/restaurants",
        title: t.moduleLabels.restaurants,
        icon: UtensilsCrossed,
        accent: "amber",
      };
    case DASHBOARD_OVERVIEW_CARD.PETS:
      return {
        href: "/pets",
        title: t.moduleLabels.pets,
        icon: PawPrint,
        accent: "rose",
      };
    case DASHBOARD_OVERVIEW_CARD.CHORES:
      return {
        href: "/chores",
        title: t.moduleLabels.chores,
        icon: ListChecks,
        accent: "orange",
      };
    case DASHBOARD_OVERVIEW_CARD.BIRTHDAYS:
      return {
        href: "/birthdays",
        title: t.moduleLabels.birthdays,
        icon: Cake,
        accent: "rose",
      };
    case DASHBOARD_OVERVIEW_CARD.CALENDAR:
      return {
        href: "/schedule",
        title: t.moduleLabels.calendar,
        icon: CalendarDays,
        accent: "sky",
      };
    case DASHBOARD_OVERVIEW_CARD.FAMILY:
      return {
        href:
          profile?.account_mode === ACCOUNT_MODE.FAMILY && profile.family_id
            ? `/profile/settings?tab=${SETTINGS_TAB.FAMILY}`
            : `/profile/settings?tab=${SETTINGS_TAB.ACCOUNT}`,
        title: t.moduleLabels.family,
        icon: Users,
        accent: "slate",
      };
  }
}
