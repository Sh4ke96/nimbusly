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
    version: "0.6.1",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Szybsze ładowanie aplikacji",
      en: "Faster app loading",
    },
    changes: {
      pl: [
        "Statyczny landing i marketing bez blokującego render cookies() w root layout",
        "Middleware: mniej zapytań Supabase na publicznych ścieżkach i cache onboardingu",
        "Fonty z display: swap; dashboard z jednym server fetch i skeletonem pod CLS",
        "PWA i Nimbus ładowane dynamicznie — mniejszy initial JS na pierwszym malowaniu",
      ],
      en: [
        "Static landing and marketing without blocking cookies() in the root layout",
        "Middleware: fewer Supabase calls on public paths and cached onboarding status",
        "Fonts with display: swap; dashboard with one server fetch and CLS-friendly skeleton",
        "PWA and Nimbus loaded dynamically — smaller initial JS on first paint",
      ],
    },
  },
  {
    version: "0.6.0",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Powiadomienia per moduł",
      en: "Per-module notifications",
    },
    changes: {
      pl: [
        "Ustawienia → Powiadomienia: macierz 11 modułów × in-app, push i e-mail",
        "Jednolity dispatch z filtrowaniem kanałów; usunięto obserwację pojedynczych list i budżetów",
        "Codzienny digest e-mail: sekcje „Dziś ważne” i „Aktywność (24 h)” z wybranych modułów",
        "Odświeżony dzwonek i widok /notifications z etykietami modułów",
      ],
      en: [
        "Settings → Notifications: 11 modules × in-app, push, and email matrix",
        "Unified dispatch with channel filters; removed per-list and per-budget watches",
        "Daily email digest: “Important today” and “Activity (24h)” from selected modules",
        "Refreshed bell and /notifications view with module labels",
      ],
    },
  },
  {
    version: "0.5.6",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Wersja i Nimbus na telefonie",
      en: "Version and Nimbus on mobile",
    },
    changes: {
      pl: [
        "Wersja aplikacji widoczna w ustawieniach profilu (link do historii zmian)",
        "Pełnoekranowy panel Nimbusa i podpowiedzi wysuwane od dołu na mobile",
        "Licznik nieprzeczytanych powiadomień na dzwonku w dolnej nawigacji mobilnej",
      ],
      en: [
        "App version shown in profile settings (link to change log)",
        "Full-width Nimbus menu and hint bar slide up from the bottom on mobile",
        "Unread notification count badge on the mobile bottom nav bell",
      ],
    },
  },
  {
    version: "0.5.5",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Płynne przejścia między stronami",
      en: "Smooth page transitions",
    },
    changes: {
      pl: [
        "Pełnoekranowy loader z pulsującym logo podczas nawigacji w aplikacji",
        "Docelowa strona pojawia się dopiero po załadowaniu — z miękkim fade-out",
      ],
      en: [
        "Full-screen loader with pulsing logo during in-app navigation",
        "Destination page appears only after load — with a soft fade-out",
      ],
    },
  },
  {
    version: "0.5.4",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Powiadomienia na żywo, preferencje i deep linki",
      en: "Live notifications, preferences, and deep links",
    },
    changes: {
      pl: [
        "Dzwonek powiadomień odświeża się na żywo (Supabase Realtime)",
        "Preferencje w profilu: push z serwera i codzienny digest e-mail",
        "Push i deep linki do listy zakupów (/shopping?list=…) i budżetu",
        "Poprawka notify-family — sprawdzanie błędu RPC przed pushem",
        "ESLint wymusza importy @/ zamiast ../ w kodzie produkcyjnym",
        "Yarn jako menedżer pakietów (yarn.lock, CI i dokumentacja)",
        "Sentry aktywny tylko na produkcji — szybszy yarn dev",
        "Usunięte podpisy „wkrótce” i placeholdery funkcji w UI",
      ],
      en: [
        "Notification bell updates live via Supabase Realtime",
        "Profile preferences: server push and daily email digest",
        "Push deep links to shopping lists (/shopping?list=…) and budgets",
        "notify-family fix — RPC error check before push dispatch",
        "ESLint enforces @/ imports instead of ../ in production code",
        "Yarn as package manager (yarn.lock, CI, and docs)",
        "Sentry enabled only in production — faster yarn dev",
        "Removed “coming soon” teasers and placeholder copy in the UI",
      ],
    },
  },
  {
    version: "0.5.3",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Sentry — śledzenie błędów",
      en: "Sentry error monitoring",
    },
    changes: {
      pl: [
        "Sentry dla błędów frontu, Server Actions, API routes i cronów",
        "Filtrowanie wrażliwych danych (tokeny, e-mail) przed wysyłką",
        "Strona global-error z i18n PL/EN i raportowaniem do Sentry",
        "Opcjonalne source mapy przez SENTRY_AUTH_TOKEN na Vercel",
      ],
      en: [
        "Sentry for frontend, Server Actions, API routes, and crons",
        "Sensitive data scrubbing (tokens, email) before send",
        "global-error page with PL/EN i18n and Sentry reporting",
        "Optional source maps via SENTRY_AUTH_TOKEN on Vercel",
      ],
    },
  },
  {
    version: "0.5.2",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Vercel Analytics i Speed Insights",
      en: "Vercel Analytics and Speed Insights",
    },
    changes: {
      pl: [
        "Vercel Web Analytics — ruch i odwiedziny w panelu Vercel",
        "Vercel Speed Insights — metryki wydajności (Core Web Vitals) na produkcji",
      ],
      en: [
        "Vercel Web Analytics — traffic and visits in the Vercel dashboard",
        "Vercel Speed Insights — performance metrics (Core Web Vitals) in production",
      ],
    },
  },
  {
    version: "0.5.1",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Push i powiadomienia obserwatorów",
      en: "Push and watcher notifications",
    },
    changes: {
      pl: [
        "iOS — stabilniejsza subskrypcja push (service worker, walidacja VAPID, ponowna próba)",
        "Push na Vercel — await wysyłki przed zakończeniem server action",
        "Listy zakupów i budżet — powiadomienia dla obserwatorów (RPC create_watcher_notifications, migracja 039)",
        "Naprawa RLS — serwer widzi wszystkich obserwatorów listy, nie tylko aktora",
        "Poprawka VAPID subject (mailto:) przy wysyłce push",
      ],
      en: [
        "iOS — more reliable push subscribe (service worker, VAPID validation, retry)",
        "Push on Vercel — await dispatch before server action exits",
        "Shopping lists and budget — watcher notifications (create_watcher_notifications RPC, migration 039)",
        "RLS fix — server loads all list watchers, not only the actor",
        "VAPID subject (mailto:) fix for push delivery",
      ],
    },
  },
  {
    version: "0.5.0",
    date: "2026-06-27",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Powiadomienia push w PWA",
      en: "PWA push notifications",
    },
    changes: {
      pl: [
        "Web Push po zainstalowaniu aplikacji — Android i iOS 16.4+ z ekranu głównego",
        "Włączanie w ustawieniach profilu i baner po instalacji PWA",
        "Push przy powiadomieniach rodzinnych i przypomnieniach budżetu",
        "Klucze VAPID (yarn push:vapid) — migracja push_subscriptions",
      ],
      en: [
        "Web Push after installing the app — Android and iOS 16.4+ from the home screen",
        "Enable in profile settings and prompt after PWA install",
        "Push for family notifications and budget payment reminders",
        "VAPID keys (yarn push:vapid) — push_subscriptions migration",
      ],
    },
  },
  {
    version: "0.4.3",
    date: "2026-06-27",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "PWA — ikona na ekranie głównym iOS",
      en: "PWA — iOS home screen icon",
    },
    changes: {
      pl: [
        "Ikony PNG (180, 192, 512 px) i apple-touch-icon — iOS nie obsługuje SVG na ekranie głównym",
        "Manifest i metadane strony wskazują na PNG zamiast samego SVG",
        "Skrypt yarn pwa:icons do regeneracji ikon z public/pwa-icon.svg",
      ],
      en: [
        "PNG icons (180, 192, 512 px) and apple-touch-icon — iOS does not use SVG on the home screen",
        "Manifest and page metadata point to PNG instead of SVG only",
        "yarn pwa:icons script to regenerate icons from public/pwa-icon.svg",
      ],
    },
  },
  {
    version: "0.4.2",
    date: "2026-06-27",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Mobile, PWA i jakość testów",
      en: "Mobile, PWA, and test quality",
    },
    changes: {
      pl: [
        "Manifest PWA z tłumaczeniami PL/EN (opis, skróty, język)",
        "Dashboard synchronizuje zakładki z parametrem ?view=modules w URL",
        "Stałe Nimbus dla actionLabel i zdarzenia zakładek ustawień",
        "Testy E2E: dolna nawigacja mobile, offline, prompt instalacji PWA",
        "Stabilniejszy selektor menu konta (data-testid)",
      ],
      en: [
        "PWA manifest with PL/EN translations (description, shortcuts, lang)",
        "Dashboard tabs stay in sync with ?view=modules in the URL",
        "Nimbus constants for actionLabel and settings-tab event",
        "E2E tests: mobile bottom nav, offline page, PWA install prompt",
        "Stable account menu selector (data-testid)",
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-06-27",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Nimbus — toury na driver.js",
      en: "Nimbus — tours on driver.js",
    },
    changes: {
      pl: [
        "Przewodniki Nimbusa korzystają z driver.js zamiast własnego overlay",
        "Popover touru: avatar, nagłówek z nazwą kroku, ramka ze skrótami klawiatury",
        "Skróty A/D i strzałki do nawigacji między krokami; Esc — pauza touru",
        "Nimbus pozostaje widoczny podczas touru (mobile i desktop)",
        "Style popovera poza warstwą Tailwind, aby nadpisać domyślne CSS driver.js",
      ],
      en: [
        "Nimbus guided tours use driver.js instead of a custom overlay",
        "Tour popover: avatar, step title header, bordered keyboard-hint panel",
        "A/D and arrow keys to move between steps; Esc pauses the tour",
        "Nimbus stays visible during tours on mobile and desktop",
        "Popover styles live outside Tailwind layers to override driver.js defaults",
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-06-23",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Mobile-first i PWA",
      en: "Mobile-first and PWA",
    },
    changes: {
      pl: [
        "Układ pod telefon: dolna nawigacja, większe cele dotykowe, bezpieczne strefy (notch)",
        "Dialogi i formularze dostosowane do małego ekranu",
        "Manifest PWA, service worker, strona offline i prompt instalacji",
        "Panel modułów dostępny z dolnego paska (?view=modules)",
      ],
      en: [
        "Phone-first layout: bottom nav, larger touch targets, safe-area insets",
        "Dialogs and forms tuned for small screens",
        "PWA manifest, service worker, offline page, and install prompt",
        "Module grid from bottom bar (?view=modules)",
      ],
    },
  },
  {
    version: "0.3.1",
    date: "2026-06-23",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Jakość, testy i synchronizacja na żywo",
      en: "Quality, tests, and live sync",
    },
    changes: {
      pl: [
        "Naprawiono panel „Wymaga uwagi” dla płatności budżetu (przekazywanie daty, przeterminowane wpisy)",
        "Realtime we wszystkich modułach rodzinnych + sekcja planowanych uprawnień w ustawieniach",
        "Testy E2E CRUD/smoke dla budżetu, urodzin, grafiku, watchlisty, restauracji i powiadomień",
        "Testy integracyjne Server Actions i deterministyczne testy jednostkowe dat",
      ],
      en: [
        "Fixed Needs attention budget payments (date forwarding, overdue entries)",
        "Realtime across all family modules + planned permissions section in settings",
        "E2E CRUD/smoke for budget, birthdays, schedule, watchlist, restaurants, and notifications",
        "Server Action integration tests and deterministic date unit tests",
      ],
    },
  },
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
        "Zaktualizowane toury i FAQ: scalone zarządzanie rodziną, typ konta tylko przy rejestracji",
        "Hinty kontekstowe, sugestie cross-modułowe z przyciskami „Pokaż tour” / „Przejdź”, celebracje pierwszych akcji",
        "Powitanie po zalogowaniu i lekkie żarty Nimbusa między podpowiedziami",
        "Wznowienie touru (Esc), wyciszenie sugestii, reakcja na panel „Wymaga uwagi”, przypinanie wpisów na górze, skrót Ctrl+K w navbarze",
        "Sekcja o Nimbusie na stronie głównej oraz testy jednostkowe modułu Nimbus",
      ],
      en: [
        "Nimbus in the bottom-right: menu, tours, FAQ, hints, and quiet mode",
        "Guides for the app, all 12 modules, family account, notifications, and solo settings",
        "Updated tours and FAQ: merged family management, account type chosen at sign-up only",
        "Context hints, cross-module suggestions with Show tour / Go actions, first-action celebrations",
        "Session greeting on sign-in and occasional Nimbus jokes between hints",
        "Tour resume (Esc), dismiss suggestions, Needs attention awareness, pin items to the top, Ctrl+K shortcut in the navbar",
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
