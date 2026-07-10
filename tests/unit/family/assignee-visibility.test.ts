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

describe("assignee visibility", () => {
  it("shows unassigned rows to any family member", () => {
    assert.equal(
      canViewAssigneeScopedRow({ created_by: "creator", assigned_to: null }, "other"),
      true
    );
  });

  it("hides assigned rows from unassigned members", () => {
    assert.equal(
      canViewAssigneeScopedRow({ created_by: "creator", assigned_to: "assignee" }, "other"),
      false
    );
  });

  it("shows assigned rows to creator and assignee", () => {
    const row = { created_by: "creator", assigned_to: "assignee" };
    assert.equal(canViewAssigneeScopedRow(row, "creator"), true);
    assert.equal(canViewAssigneeScopedRow(row, "assignee"), true);
  });

  it("filters rows for medicine taken_by", () => {
    const rows = [
      { created_by: "a", taken_by: "b" },
      { created_by: "a", taken_by: null },
    ];
    assert.deepEqual(filterAssigneeScopedRows(rows, "c", "taken_by"), [rows[1]]);
  });

  it("resolves notification recipients", () => {
    assert.deepEqual(resolveAssigneeNotificationRecipients("user-1"), ["user-1"]);
    assert.equal(resolveAssigneeNotificationRecipients(null), undefined);
    assert.deepEqual(resolveBudgetNotificationRecipients(["u1", "u2"]), ["u1", "u2"]);
    assert.deepEqual(
      resolveGiftNotificationRecipients({
        recipientMemberId: "gift-for",
        visibleToMemberIds: [],
      }),
      ["gift-for"]
    );
  });

  it("budget with members restricts to listed members and creator", () => {
    assert.equal(
      canViewBudgetForMember({
        createdBy: "creator",
        viewerId: "other",
        memberIds: ["member-a"],
      }),
      false
    );
    assert.equal(
      canViewBudgetForMember({
        createdBy: "creator",
        viewerId: "member-a",
        memberIds: ["member-a"],
      }),
      true
    );
    assert.equal(
      canViewBudgetForMember({
        createdBy: "creator",
        viewerId: "anyone",
        memberIds: [],
      }),
      true
    );
  });

  it("filters member visibility rows for notes-style arrays", () => {
    const row = { created_by: "author", visible_to_member_ids: ["viewer"] };
    assert.equal(canViewMemberVisibilityRow(row, "viewer"), true);
    assert.equal(canViewMemberVisibilityRow(row, "other"), false);
    assert.equal(canViewMemberVisibilityRow({ created_by: "author", visible_to_member_ids: [] }, "other"), true);
  });
});
