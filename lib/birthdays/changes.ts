import type { BirthdayEntry } from "@/lib/birthdays/types";
import { formatBirthdayLabel } from "@/lib/birthdays/types";

export function buildBirthdayChangeSummary(
  before: Pick<BirthdayEntry, "person_name" | "birth_month" | "birth_day" | "description">,
  after: Pick<BirthdayEntry, "person_name" | "birth_month" | "birth_day" | "description">,
  lang: "pl" | "en"
): string {
  const parts: string[] = [];

  if (before.person_name !== after.person_name) {
    parts.push(
      lang === "pl"
        ? `imię: ${before.person_name} → ${after.person_name}`
        : `name: ${before.person_name} → ${after.person_name}`
    );
  }

  if (before.birth_month !== after.birth_month || before.birth_day !== after.birth_day) {
    const from = formatBirthdayLabel(before);
    const to = formatBirthdayLabel(after);
    parts.push(lang === "pl" ? `data: ${from} → ${to}` : `date: ${from} → ${to}`);
  }

  if (before.description !== after.description) {
    parts.push(lang === "pl" ? "zaktualizowano opis" : "description updated");
  }

  if (parts.length === 0) {
    return lang === "pl" ? "brak zmian" : "no changes";
  }

  return parts.join(lang === "pl" ? "; " : "; ");
}
