/** Returns true when local time falls inside quiet hours (supports overnight ranges). */
export function isWithinQuietHours(
  now: Date,
  startMinutes: number,
  endMinutes: number
): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) {
    return current >= startMinutes && current < endMinutes;
  }
  return current >= startMinutes || current < endMinutes;
}

export function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
  return hours * 60 + minutes;
}

export function shouldSuppressPushForQuietHours(params: {
  enabled: boolean;
  quietStart: string;
  quietEnd: string;
  now?: Date;
}): boolean {
  if (!params.enabled) return false;
  const now = params.now ?? new Date();
  return isWithinQuietHours(
    now,
    parseTimeToMinutes(params.quietStart),
    parseTimeToMinutes(params.quietEnd)
  );
}
