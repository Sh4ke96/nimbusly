import {
  CHANGELOG_ENTRY_TYPE,
  type ChangelogEntry,
} from "@/lib/constants/changelog";

export { CHANGELOG_ENTRY_TYPE, type ChangelogEntry };

/**
 * Newest release first. When shipping features/fixes, add an entry here
 * and bump `version` in package.json to match the top entry.
 */
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "0.3.0",
    date: "2026-06-14",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Nimbus — towarzysz po aplikacji",
      en: "Nimbus — your in-app companion",
    },
    changes: {
      pl: [
        "Nimbus w prawym dolnym rogu: menu, toury, FAQ, podpowiedzi i tryb cichy",
        "Przewodniki po aplikacji, każdym module (12), koncie rodzinnym, powiadomieniach i ustawieniach solo",
        "Hinty kontekstowe, sugestie cross-modułowe z przyciskami „Pokaż tour” / „Przejdź”, celebracje pierwszych akcji",
        "Wznowienie touru (Esc), wyciszenie sugestii, reakcja na panel „Wymaga uwagi”, skrót Ctrl+K w navbarze",
        "Sekcja o Nimbusie na stronie głównej oraz testy jednostkowe modułu Nimbus",
      ],
      en: [
        "Nimbus in the bottom-right: menu, tours, FAQ, hints, and quiet mode",
        "Guides for the app, all 12 modules, family account, notifications, and solo settings",
        "Context hints, cross-module suggestions with Show tour / Go actions, first-action celebrations",
        "Tour resume (Esc), dismiss suggestions, Needs attention awareness, Ctrl+K shortcut in the navbar",
        "Nimbus section on the landing page and unit tests for the companion module",
      ],
    },
  },
  {
    version: "0.2.1",
    date: "2026-06-14",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Spójność UI i panel uwagi",
      en: "UI consistency and attention panel",
    },
    changes: {
      pl: [
        "Wspólne pickery członków rodziny i widoczności w notatkach oraz prezentach",
        "Ujednolicone kafelki wyboru we wszystkich formularzach",
        "Panel „Wymaga uwagi”: terminy płatności budżetu, kończące się wpisy grafiku, pilne notatki (!)",
        "Testy integracyjne Server Actions, E2E CRUD modułów i testy komponentów",
      ],
      en: [
        "Shared family member and visibility pickers for notes and gifts",
        "Unified selection tiles across all forms",
        "Needs attention: budget payment due dates, ending schedule entries, urgent notes (!)",
        "Integration tests for Server Actions, module E2E CRUD flows, and component tests",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-06-14",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Budżet, panel i wersjonowanie",
      en: "Budget, dashboard, and versioning",
    },
    changes: {
      pl: [
        "Budżet: cykliczne wydatki i dochody, ukrywanie budżetów, przypomnienia o terminie płatności",
        "Notatki: własne kategorie z emoji i widocznością w rodzinie",
        "Grafik: zakresy dat dla urlopów i wydarzeń wielodniowych",
        "Panel: zakładki Podsumowanie / Moduły, sekcja „Wymaga uwagi” w kolorze brązowym",
        "Publiczna strona historii zmian (/change-log) i badge wersji",
      ],
      en: [
        "Budget: recurring income and expenses, hidden budgets, payment due reminders",
        "Notes: custom emoji categories and family visibility",
        "Schedule: date ranges for vacations and multi-day entries",
        "Dashboard: Summary / Modules tabs, brown “Needs attention” section",
        "Public change log (/change-log) and version badge",
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-03-01",
    type: CHANGELOG_ENTRY_TYPE.MAJOR,
    title: {
      pl: "Pierwsza wersja Nimbusly",
      en: "Initial Nimbusly release",
    },
    changes: {
      pl: [
        "Budżet, listy zakupów, prezenty, urodziny i grafik pracy",
        "Apteczka, filmy i seriale, restauracje, zwierzęta, obowiązki domowe",
        "Konta solo i rodzinne, powiadomienia, zaproszenia do rodziny",
      ],
      en: [
        "Budget, shopping lists, gifts, birthdays, and work schedule",
        "Medicine cabinet, watchlist, restaurants, pets, and chores",
        "Solo and family accounts, notifications, family invites",
      ],
    },
  },
];

export const APP_VERSION = CHANGELOG_ENTRIES[0]?.version ?? "0.0.0";

export function getChangelogEntries(): ChangelogEntry[] {
  return CHANGELOG_ENTRIES;
}

export function getChangelogEntryByVersion(version: string): ChangelogEntry | undefined {
  return CHANGELOG_ENTRIES.find((entry) => entry.version === version);
}
