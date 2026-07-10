/** Single-member assignment on a family row (chores, medicine). */
export type AssigneeScopedRow = {
  created_by: string;
  assigned_to?: string | null;
  taken_by?: string | null;
};

export type AssigneeField = "assigned_to" | "taken_by";

function resolveAssigneeId(row: AssigneeScopedRow, field: AssigneeField): string | null {
  return row[field] ?? null;
}

/** Unassigned rows stay visible to the whole family; assignee + creator always see. */
export function canViewAssigneeScopedRow(
  row: AssigneeScopedRow,
  viewerId: string,
  field: AssigneeField = "assigned_to"
): boolean {
  const assigneeId = resolveAssigneeId(row, field);
  if (!assigneeId) return true;
  return row.created_by === viewerId || assigneeId === viewerId;
}

export function filterAssigneeScopedRows<T extends AssigneeScopedRow>(
  rows: T[],
  viewerId: string,
  field: AssigneeField = "assigned_to"
): T[] {
  return rows.filter((row) => canViewAssigneeScopedRow(row, viewerId, field));
}

export function resolveAssigneeNotificationRecipients(
  assigneeId: string | null | undefined
): string[] | undefined {
  if (!assigneeId) return undefined;
  return [assigneeId];
}

export function canViewBudgetForMember(params: {
  createdBy: string;
  viewerId: string;
  memberIds: string[];
}): boolean {
  if (params.createdBy === params.viewerId) return true;
  if (params.memberIds.length === 0) return true;
  return params.memberIds.includes(params.viewerId);
}

export function resolveBudgetNotificationRecipients(memberIds: string[]): string[] | undefined {
  return memberIds.length > 0 ? memberIds : undefined;
}

export function resolveGiftNotificationRecipients(params: {
  recipientMemberId: string | null;
  visibleToMemberIds: string[];
}): string[] | undefined {
  if (params.visibleToMemberIds.length > 0) return params.visibleToMemberIds;
  if (params.recipientMemberId) return [params.recipientMemberId];
  return undefined;
}

export function canViewMemberVisibilityRow(
  row: { created_by: string; visible_to_member_ids?: string[] },
  viewerId: string
): boolean {
  const memberIds = row.visible_to_member_ids ?? [];
  if (row.created_by === viewerId) return true;
  if (memberIds.length === 0) return true;
  return memberIds.includes(viewerId);
}
