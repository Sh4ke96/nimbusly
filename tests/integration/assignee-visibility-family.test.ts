import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canViewAssigneeScopedRow,
  canViewBudgetForMember,
  canViewMemberVisibilityRow,
  filterAssigneeScopedRows,
  resolveAssigneeNotificationRecipients,
  resolveBudgetNotificationRecipients,
  resolveGiftNotificationRecipients,
} from "@/lib/family/assignee-visibility";

const FAMILY = {
  CREATOR: "user-creator",
  ASSIGNEE: "user-assignee",
  SIBLING: "user-sibling",
} as const;

describe("family assignee visibility (multi-user)", () => {
  it("chores: sibling cannot see assignee-only task; creator and assignee can", () => {
    const chore = { created_by: FAMILY.CREATOR, assigned_to: FAMILY.ASSIGNEE };

    assert.equal(canViewAssigneeScopedRow(chore, FAMILY.SIBLING), false);
    assert.equal(canViewAssigneeScopedRow(chore, FAMILY.CREATOR), true);
    assert.equal(canViewAssigneeScopedRow(chore, FAMILY.ASSIGNEE), true);
  });

  it("chores: unassigned tasks remain visible to whole family", () => {
    const chore = { created_by: FAMILY.CREATOR, assigned_to: null };

    assert.equal(canViewAssigneeScopedRow(chore, FAMILY.SIBLING), true);
    assert.equal(canViewAssigneeScopedRow(chore, FAMILY.ASSIGNEE), true);
  });

  it("medicine: taken_by restricts visibility like chores assignee", () => {
    const medicine = { created_by: FAMILY.CREATOR, taken_by: FAMILY.ASSIGNEE };
    const rows = [
      medicine,
      { created_by: FAMILY.CREATOR, taken_by: null },
    ];

    assert.deepEqual(filterAssigneeScopedRows(rows, FAMILY.SIBLING, "taken_by"), [rows[1]]);
    assert.deepEqual(filterAssigneeScopedRows(rows, FAMILY.ASSIGNEE, "taken_by"), rows);
    assert.equal(canViewAssigneeScopedRow(medicine, FAMILY.SIBLING, "taken_by"), false);
  });

  it("budget: member list restricts access to listed members and creator", () => {
    const memberIds = [FAMILY.ASSIGNEE];

    assert.equal(
      canViewBudgetForMember({
        createdBy: FAMILY.CREATOR,
        viewerId: FAMILY.SIBLING,
        memberIds,
      }),
      false
    );
    assert.equal(
      canViewBudgetForMember({
        createdBy: FAMILY.CREATOR,
        viewerId: FAMILY.ASSIGNEE,
        memberIds,
      }),
      true
    );
    assert.equal(
      canViewBudgetForMember({
        createdBy: FAMILY.CREATOR,
        viewerId: FAMILY.CREATOR,
        memberIds,
      }),
      true
    );
    assert.equal(
      canViewBudgetForMember({
        createdBy: FAMILY.CREATOR,
        viewerId: FAMILY.SIBLING,
        memberIds: [],
      }),
      true
    );
  });

  it("gifts: recipient-only when visibility list is empty", () => {
    assert.deepEqual(
      resolveGiftNotificationRecipients({
        recipientMemberId: FAMILY.ASSIGNEE,
        visibleToMemberIds: [],
      }),
      [FAMILY.ASSIGNEE]
    );
    assert.deepEqual(
      resolveGiftNotificationRecipients({
        recipientMemberId: FAMILY.ASSIGNEE,
        visibleToMemberIds: [FAMILY.CREATOR, FAMILY.SIBLING],
      }),
      [FAMILY.CREATOR, FAMILY.SIBLING]
    );
  });

  it("notes: visible_to_member_ids limits readers; author always sees", () => {
    const note = {
      created_by: FAMILY.CREATOR,
      visible_to_member_ids: [FAMILY.ASSIGNEE],
    };

    assert.equal(canViewMemberVisibilityRow(note, FAMILY.ASSIGNEE), true);
    assert.equal(canViewMemberVisibilityRow(note, FAMILY.SIBLING), false);
    assert.equal(canViewMemberVisibilityRow(note, FAMILY.CREATOR), true);
  });

  it("assignee notifications target only the assignee", () => {
    assert.deepEqual(resolveAssigneeNotificationRecipients(FAMILY.ASSIGNEE), [FAMILY.ASSIGNEE]);
    assert.equal(resolveAssigneeNotificationRecipients(null), undefined);
    assert.deepEqual(resolveBudgetNotificationRecipients([FAMILY.ASSIGNEE, FAMILY.SIBLING]), [
      FAMILY.ASSIGNEE,
      FAMILY.SIBLING,
    ]);
  });
});
