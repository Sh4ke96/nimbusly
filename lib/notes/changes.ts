import type { Note } from "@/lib/notes/types";
import { resolveNoteCategoryLabel } from "@/lib/notes/types";
import type { NoteCategory } from "@/lib/notes/types";
import type { Dict } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n/format";

type NoteChangeLabels = Pick<
  Dict["notes"],
  | "changeSummaryTitle"
  | "changeSummaryCategory"
  | "changeSummaryContent"
  | "changeSummaryVisibility"
  | "changeSummaryEmpty"
  | "changeSummarySeparator"
  | "uncategorizedLabel"
>;

function formatVisibilityLabel(
  visibleToMemberIds: string[],
  labels: Pick<Dict["notes"], "visibilityAllFamily" | "visibilitySelectedMembers">
): string {
  return visibleToMemberIds.length === 0
    ? labels.visibilityAllFamily
    : labels.visibilitySelectedMembers;
}

export function buildNoteChangeSummary(
  before: Pick<Note, "title" | "category_id" | "content" | "visible_to_member_ids">,
  after: Pick<Note, "title" | "category_id" | "content" | "visible_to_member_ids">,
  categories: NoteCategory[],
  labels: NoteChangeLabels &
    Pick<Dict["notes"], "visibilityAllFamily" | "visibilitySelectedMembers">
): string {
  const parts: string[] = [];

  if (before.title !== after.title) {
    parts.push(
      formatMessage(labels.changeSummaryTitle, {
        from: before.title,
        to: after.title,
      })
    );
  }

  if (before.category_id !== after.category_id) {
    parts.push(
      formatMessage(labels.changeSummaryCategory, {
        from: resolveNoteCategoryLabel(before.category_id, categories, labels.uncategorizedLabel),
        to: resolveNoteCategoryLabel(after.category_id, categories, labels.uncategorizedLabel),
      })
    );
  }

  if (before.content !== after.content) {
    parts.push(labels.changeSummaryContent);
  }

  const beforeVisibility = formatVisibilityLabel(before.visible_to_member_ids, labels);
  const afterVisibility = formatVisibilityLabel(after.visible_to_member_ids, labels);
  if (beforeVisibility !== afterVisibility) {
    parts.push(labels.changeSummaryVisibility);
  }

  if (parts.length === 0) return labels.changeSummaryEmpty;
  return parts.join(labels.changeSummarySeparator);
}

export function formatNoteNotificationDetail(
  title: string,
  content: string,
  labels: Pick<Dict["notes"], "notificationDetailSeparator">
): string {
  const trimmed = content.trim();
  if (!trimmed) return title;
  return `${title}${labels.notificationDetailSeparator}${trimmed}`;
}
