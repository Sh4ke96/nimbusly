export const INVITATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REVOKED: "revoked",
} as const;

export type InvitationStatus =
  (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

export const INVITATION_STATUSES = Object.values(
  INVITATION_STATUS
) as InvitationStatus[];
