export function parseVisibleMemberIdsJson(raw: string): string[] | null {
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((value) => typeof value === "string" && value.trim().length > 0)) {
      return null;
    }
    return [...new Set(parsed.map((value) => value.trim()))];
  } catch {
    return null;
  }
}

export function serializeVisibleMemberIds(ids: string[]): string {
  return JSON.stringify(ids);
}

export function isGiftVisibleToAllMembers(visibleToMemberIds: string[]): boolean {
  return visibleToMemberIds.length === 0;
}
