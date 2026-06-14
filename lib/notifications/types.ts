export type { NotificationType } from "@/lib/constants/notifications";
export { NOTIFICATION_TYPE } from "@/lib/constants/notifications";

import type { NotificationType } from "@/lib/constants/notifications";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface BirthdayNotificationPayload {
  birthday_id: string;
  person_name: string;
  actor_id: string;
  family_id: string;
  change_summary?: string | null;
  updated_at?: string | null;
}
