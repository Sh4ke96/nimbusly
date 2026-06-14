import {
  getAppModuleLabel,
  getAppModuleOverviewMeta,
  getAppModuleRoute,
} from "@/lib/constants/app-modules";
import { type OverviewAccent } from "@/lib/constants/overview-accent";
import { type DashboardOverviewCardId } from "@/lib/constants/dashboard-overview";
import type { Dict } from "@/lib/i18n/types";
import type { Profile } from "@/lib/profile";
import type { LucideIcon } from "lucide-react";

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
  const meta = getAppModuleOverviewMeta(cardId);

  return {
    href: getAppModuleRoute(cardId, profile),
    title: getAppModuleLabel(cardId, t.moduleLabels),
    icon: meta.icon,
    accent: meta.overviewAccent,
    className: meta.overviewClassName,
  };
}
