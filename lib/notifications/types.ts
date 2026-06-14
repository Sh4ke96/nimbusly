export type NotificationType = "birthday_added";

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

export interface BirthdayAddedPayload {
  birthday_id: string;
  person_name: string;
  actor_id: string;
  family_id: string;
}
