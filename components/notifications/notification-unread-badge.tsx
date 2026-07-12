import { cn } from "@/lib/utils";

export const NOTIFICATION_UNREAD_BADGE_MAX = 9;

export function formatUnreadNotificationCount(count: number): string {
  return count > NOTIFICATION_UNREAD_BADGE_MAX
    ? `${NOTIFICATION_UNREAD_BADGE_MAX}+`
    : String(count);
}

interface NotificationUnreadBadgeProps {
  count: number;
  className?: string;
}

export function NotificationUnreadBadge({ count, className }: NotificationUnreadBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex min-h-4 min-w-4 items-center justify-center rounded-none bg-primary px-1",
        "text-[10px] font-bold leading-none text-primary-foreground",
        className
      )}
      aria-hidden
    >
      {formatUnreadNotificationCount(count)}
    </span>
  );
}
