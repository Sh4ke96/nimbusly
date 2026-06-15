export const CHANGELOG_ENTRY_TYPE = {
  MAJOR: "major",
  MINOR: "minor",
  FIX: "fix",
} as const;

export type ChangelogEntryType =
  (typeof CHANGELOG_ENTRY_TYPE)[keyof typeof CHANGELOG_ENTRY_TYPE];

export interface ChangelogEntry {
  version: string;
  date: string;
  type: ChangelogEntryType;
  title: { pl: string; en: string };
  changes: { pl: string[]; en: string[] };
}
