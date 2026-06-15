import { CHANGELOG_ENTRIES } from "@/lib/changelog/entries";
import type { Lang } from "@/lib/constants/lang";

export function buildChangelogHintMessage(
  lang: Lang,
  introTemplate: string,
  outro: string,
  maxBullets = 3
): string | null {
  const entry = CHANGELOG_ENTRIES[0];
  if (!entry) return null;

  const bullets = entry.changes[lang].slice(0, maxBullets).map((line) => `• ${line}`);
  if (bullets.length === 0) return null;

  const intro = introTemplate.replace("{version}", entry.version);
  return `${intro}\n\n${bullets.join("\n")}\n\n${outro}`;
}
