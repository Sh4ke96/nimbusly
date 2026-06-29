import { NOTIFICATION_CHANNEL, type NotificationChannel } from "@/lib/constants/notification-channels";
import type { NotificationModulePreferencesMap } from "@/lib/notifications/module-preferences/types";

function isChannelEnabled(
  pref: { inAppEnabled: boolean; pushEnabled: boolean; emailDigestEnabled: boolean },
  channel: NotificationChannel
): boolean {
  switch (channel) {
    case NOTIFICATION_CHANNEL.IN_APP:
      return pref.inAppEnabled;
    case NOTIFICATION_CHANNEL.PUSH:
      return pref.pushEnabled;
    case NOTIFICATION_CHANNEL.EMAIL_DIGEST:
      return pref.emailDigestEnabled;
    default:
      return false;
  }
}

export function filterRecipientIdsByChannel(
  recipientIds: string[],
  preferences: NotificationModulePreferencesMap,
  channel: NotificationChannel
): string[] {
  return recipientIds.filter((userId) => {
    const pref = preferences.get(userId);
    if (!pref) return channel === NOTIFICATION_CHANNEL.IN_APP;
    return isChannelEnabled(pref, channel);
  });
}

export function partitionRecipientsByChannel(
  recipientIds: string[],
  preferences: NotificationModulePreferencesMap
): {
  inAppIds: string[];
  pushIds: string[];
  emailDigestIds: string[];
} {
  return {
    inAppIds: filterRecipientIdsByChannel(
      recipientIds,
      preferences,
      NOTIFICATION_CHANNEL.IN_APP
    ),
    pushIds: filterRecipientIdsByChannel(recipientIds, preferences, NOTIFICATION_CHANNEL.PUSH),
    emailDigestIds: filterRecipientIdsByChannel(
      recipientIds,
      preferences,
      NOTIFICATION_CHANNEL.EMAIL_DIGEST
    ),
  };
}
