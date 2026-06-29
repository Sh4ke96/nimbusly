import type { AttentionItem } from "@/lib/dashboard/attention";
import { getAttentionModuleId } from "@/lib/dashboard/attention";
import type { NotificationModuleId } from "@/lib/constants/notification-modules";
import type { NotificationModulePreference } from "@/lib/notifications/module-preferences/types";
import { getNotificationModuleId } from "@/lib/notifications/module-route";
import type { AppNotification } from "@/lib/notifications/types";

export interface DailyDigestSection {
  moduleId: NotificationModuleId;
  title: string;
  lines: string[];
}

export function filterAttentionItemsForDigest(
  items: AttentionItem[],
  preferences: NotificationModulePreference[]
): AttentionItem[] {
  const enabled = new Set(
    preferences.filter((pref) => pref.emailDigestEnabled).map((pref) => pref.moduleId)
  );
  return items.filter((item) => enabled.has(getAttentionModuleId(item.kind)));
}

export function groupNotificationsForDigest(
  notifications: AppNotification[],
  preferences: NotificationModulePreference[]
): DailyDigestSection[] {
  const enabled = new Set(
    preferences.filter((pref) => pref.emailDigestEnabled).map((pref) => pref.moduleId)
  );

  const byModule = new Map<NotificationModuleId, string[]>();

  for (const notification of notifications) {
    const moduleId = getNotificationModuleId(notification.type);
    if (!moduleId || !enabled.has(moduleId)) continue;
    const lines = byModule.get(moduleId) ?? [];
    lines.push(`${notification.title} — ${notification.body}`);
    byModule.set(moduleId, lines);
  }

  return [...byModule.entries()].map(([moduleId, lines]) => ({
    moduleId,
    title: moduleId,
    lines,
  }));
}

export function hasDigestContent(sections: DailyDigestSection[]): boolean {
  return sections.some((section) => section.lines.length > 0);
}
