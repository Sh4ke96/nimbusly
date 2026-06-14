/**
 * Email notifications — planned for a follow-up (Resend).
 * In-app notifications are handled via `notifications` table + UI.
 */
export async function sendBirthdayNotificationEmail(): Promise<{ sent: false }> {
  return { sent: false };
}
