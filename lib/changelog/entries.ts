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
    version: "0.14.2",
    date: "2026-07-22",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Higiena po audycie",
      en: "Post-audit hygiene",
    },
    changes: {
      pl: [
        "Migracja 055: usunięte complete_founder_onboarding i przestarzała polityka RLS families INSERT",
        "Nawigacja modułów w headerze na APP_MODULE_DISCOVER_IDS (jak dashboard i mobile)",
        "Jeden cel tour FAMILY_MEMBERS; usunięty martwy familyInsertPayload i copy familyTab",
      ],
      en: [
        "Migration 055: dropped complete_founder_onboarding and stale families INSERT RLS policy",
        "Header module nav uses APP_MODULE_DISCOVER_IDS (same as dashboard and mobile)",
        "Single FAMILY_MEMBERS tour target; removed dead familyInsertPayload and familyTab copy",
      ],
    },
  },
  {
    version: "0.14.1",
    date: "2026-07-22",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Domknięcie audytu bezpieczeństwa i UX",
      en: "Security and UX audit closeout",
    },
    changes: {
      pl: [
        "Migracja 054: revoke INSERT na families, atomowe onboard_create_family, usunięte martwe RPC",
        "Budżet: emptyFiltered i CTA wyczyść filtry; chores kalendarz z tym samym wzorcem",
        "Desktop i mobile: ta sama lista modułów (APP_MODULE_DISCOVER_IDS)",
        "Nimbus: krok tour Dzisiaj, context hints /family, stałe FAMILY_CALENDAR_VIEW",
        "Cookie zaproszeń z flagą Secure w produkcji; testy RPC onboardingu i push HTTPS",
      ],
      en: [
        "Migration 054: revoke families INSERT, atomic onboard_create_family, removed dead RPCs",
        "Budget: emptyFiltered and clear-filters CTA; chores calendar uses the same pattern",
        "Desktop and mobile share the same module list (APP_MODULE_DISCOVER_IDS)",
        "Nimbus: Today tour step, /family context hints, FAMILY_CALENDAR_VIEW constant",
        "Invite cookies use Secure in production; onboarding RPC and push HTTPS tests",
      ],
    },
  },
  {
    version: "0.14.0",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Bezpieczeństwo onboardingu i spójność modułów",
      en: "Onboarding security and module consistency",
    },
    changes: {
      pl: [
        "Atomowe RPC onboardingu (kod zaproszenia i token e-mail) oraz migracja 053",
        "Kod zaproszenia rodziny tylko dla właściciela; push wymaga HTTPS w produkcji",
        "ModulePageHeader we wszystkich modułach, wspólne karty modułów i empty states",
        "Nimbus: tour mobile modułów, ścieżka /family, stałe cele tour",
      ],
      en: [
        "Atomic onboarding RPCs (invite code and email token) plus migration 053",
        "Family invite code owner-only; push subscriptions require HTTPS in production",
        "ModulePageHeader across modules, shared module cards and empty states",
        "Nimbus: mobile modules tour step, /family path tour, tour target constants",
      ],
    },
  },
  {
    version: "0.13.1",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Moduły na mobile bez duplikatu",
      en: "No duplicate modules on mobile",
    },
    changes: {
      pl: [
        "Siatka modułów na dashboardzie tylko na desktopie; na mobile wyłącznie dolny sheet",
        "Deep link ?view=modules na mobile otwiera sheet zamiast drugiej listy",
      ],
      en: [
        "Dashboard module grid on desktop only; mobile uses the bottom sheet",
        "Deep link ?view=modules on mobile opens the sheet instead of a second list",
      ],
    },
  },
  {
    version: "0.13.0",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Bezpieczeństwo onboarding + spójny UX modułów",
      en: "Onboarding security and unified module UX",
    },
    changes: {
      pl: [
        "Onboarding: bezpieczne RPC (solo, founder, join, finalize) zamiast complete_onboarding_profile",
        "create_family_and_join, get_family_invite_code, rate limit join, wydatki budżetu tylko dla autora",
        "Notatki: sanityzacja markdown przy zapisie; dashboard: błędy zapytań zamiast pustych danych",
        "ModulePageShell we wszystkich modułach; akcenty modułów w siatce i nagłówkach",
        "Karta kalendarza rodziny na dashboardzie; dolny sheet modułów na mobile",
        "ModuleEmptyState w restauracjach i powiadomieniach; usunięty martwy QuickAddFab",
        "Kalendarz: rounded-none na wpisach; jeden empty state w kalendarzu rodziny",
      ],
      en: [
        "Onboarding: secure RPCs (solo, founder, join, finalize) replacing complete_onboarding_profile",
        "create_family_and_join, get_family_invite_code, join rate limit, budget expenses owner-only edits",
        "Notes: markdown sanitization on save; dashboard: surface query errors instead of silent empty data",
        "ModulePageShell across modules; module accents in grid and headers",
        "Family calendar overview card; mobile modules bottom sheet",
        "ModuleEmptyState in restaurants and notifications; removed dead QuickAddFab",
        "Calendar: rounded-none entry buttons; single empty state on family calendar",
      ],
    },
  },
  {
    version: "0.12.0",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.MAJOR,
    title: {
      pl: "Utwardzenie bezpieczeństwa",
      en: "Security hardening",
    },
    changes: {
      pl: [
        "Profile: blokada bezpośredniej zmiany roli, rodziny i onboardingu z klienta",
        "Powiadomienia rodzinne tylko przez serwer (service role)",
        "OAuth: walidacja parametru next (ochrona przed open redirect)",
        "Zaproszenia: auth.uid() w accept, rate limit lookup kodu, join przez RPC",
        "Middleware: cron bez redirectu logowania, onboarding zawsze z bazy",
        "Notatki: sanityzacja linków markdown, storage dla załączników rodziny",
        "Push: walidacja subskrypcji, cron z timing-safe compare",
      ],
      en: [
        "Profiles: block direct client updates to role, family, and onboarding flags",
        "Family notifications only via server (service role)",
        "OAuth: validate next param (open redirect protection)",
        "Invites: auth.uid() in accept, lookup rate limit, join via RPC",
        "Middleware: cron routes skip login redirect, onboarding always from DB",
        "Notes: markdown link sanitization, family attachment storage access",
        "Push: subscription validation, timing-safe cron secret compare",
      ],
    },
  },
  {
    version: "0.11.9",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Szybkie dodawanie w kalendarzu rodziny",
      en: "Quick add on the family calendar",
    },
    changes: {
      pl: [
        "Przycisk + w nagłówku znów działa na /calendar (wcześniej ukryty jako podgląd)",
      ],
      en: [
        "Header + quick add works again on /calendar (was hidden as view-only)",
      ],
    },
  },
  {
    version: "0.11.8",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Jedna legenda kalendarza na mobile",
      en: "Single family calendar legend on mobile",
    },
    changes: {
      pl: [
        "Urodziny, obowiązki i kategorie grafiku w jednym rzędzie pod kalendarzem",
      ],
      en: [
        "Birthdays, chores, and schedule categories in one row below the calendar",
      ],
    },
  },
  {
    version: "0.11.7",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Legenda kategorii grafiku w kalendarzu",
      en: "Family calendar schedule legend layout",
    },
    changes: {
      pl: [
        "Desktop: kategorie grafiku w tej samej formie co urodziny i obowiązki (kolor + etykieta)",
        "Mobile: legenda w jednym rzędzie, kategorie obok siebie",
      ],
      en: [
        "Desktop: schedule categories use the same color-square legend as birthdays and chores",
        "Mobile: legend items flow in a single row side by side",
      ],
    },
  },
  {
    version: "0.11.6",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Kategorie grafiku w kalendarzu rodziny",
      en: "Schedule categories in the family calendar",
    },
    changes: {
      pl: [
        "Pod kalendarzem rodziny legenda typów grafiku z ikonami (praca, wolne, zakupy i inne)",
        "Kreski w siatce i lista dnia pokazują kolor i typ wpisu grafiku",
      ],
      en: [
        "Family calendar shows a schedule-type legend with icons (work, free, shopping, and more)",
        "Grid bars and the day list use colors and labels per schedule entry type",
      ],
    },
  },
  {
    version: "0.11.5",
    date: "2026-07-21",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Kalendarz mobilny, szybkie dodawanie w nagłówku i uproszczone obowiązki",
      en: "Mobile calendar, header quick add, and simplified chores",
    },
    changes: {
      pl: [
        "Kalendarz rodziny na mobile: pełny miesiąc, kolorowe kreski, legenda i lista wybranego dnia",
        "Szybkie dodawanie (+) obok wyszukiwarki na mobile; formularz obowiązku ma wszystkie pola jak przy normalnym dodawaniu",
        "Usunięto status „W trakcie” z obowiązków (istniejące wpisy traktowane jak oczekujące)",
      ],
      en: [
        "Family calendar on mobile: full month, color bars, legend, and selected-day list",
        "Quick add (+) next to search on mobile; chore quick add includes the full form fields",
        "Removed the In progress chore status (existing rows count as pending)",
      ],
    },
  },
  {
    version: "0.11.4",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Demo: kalendarz rodziny z siatką miesiąca",
      en: "Demo: family calendar month grid",
    },
    changes: {
      pl: [
        "Sekcja kalendarza rodzinnego w demo pokazuje legendę, nawigację miesiąca i kolorowe wpisy",
        "Moduł grafiku w demo ma osobny opis od kalendarza rodzinnego",
      ],
      en: [
        "Family calendar demo shows legend, month navigation, and color-coded entries",
        "Schedule module demo has its own description separate from the family calendar",
      ],
    },
  },
  {
    version: "0.11.3",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa zawieszonego loadera nawigacji",
      en: "Fix stuck navigation loader",
    },
    changes: {
      pl: [
        "Loader znika po przerwanej nawigacji (np. szybki powrót do /dashboard) i ma limit czasu jako zabezpieczenie",
      ],
      en: [
        "Loader dismisses after interrupted navigation (e.g. quick return to /dashboard) and has a timeout safety cap",
      ],
    },
  },
  {
    version: "0.11.2",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Czytelniejszy opis demo na stronie głównej",
      en: "Clearer landing demo copy",
    },
    changes: {
      pl: [
        "Opis sekcji demo skupia się na korzyści dla użytkownika, bez technicznych wzmianek o bazie danych",
      ],
      en: [
        "Landing demo copy focuses on user value, without technical database mentions",
      ],
    },
  },
  {
    version: "0.11.1",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Większe demo na stronie głównej",
      en: "Larger landing page demo",
    },
    changes: {
      pl: [
        "Sekcja demo na / jest nieco szersza i wyższa, żeby lepiej pokazać panel",
      ],
      en: [
        "The / demo section is slightly wider and taller for a clearer panel preview",
      ],
    },
  },
  {
    version: "0.11.0",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Sprint stabilizacji: kalendarz, UX i mobile",
      en: "Stabilization sprint: calendar, UX, and mobile",
    },
    changes: {
      pl: [
        "Kalendarz rodziny w nawigacji, wyszukiwaniu i demo; lepsze stany pusty/ładowanie/błąd",
        "Naprawa wyścigów przy odhaczaniu zakupów i obowiązków; powiadomienia aktualizują się dopiero po sukcesie",
        "Wspólne puste stany modułów, tokeny statusów, rounded-none w UI, mobilna nawigacja landingu i krótsze etykiety dolnego paska",
        "Nimbus: przewodnik po /calendar, podpowiedzi kontekstowe i podsumowanie touru",
      ],
      en: [
        "Family calendar in nav, search, and demo; improved empty, loading, and error states",
        "Race fixes for shopping checkboxes and chores; notifications update only after server success",
        "Shared module empty states, status tokens, rounded-none UI polish, landing mobile nav, and shorter bottom-nav labels",
        "Nimbus: /calendar tour, context hints, and tour summary",
      ],
    },
  },
  {
    version: "0.10.0",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Interaktywne demo na stronie głównej",
      en: "Interactive demo on the landing page",
    },
    changes: {
      pl: [
        "Sekcja demo na / z podglądem panelu i wszystkich modułów bez logowania",
        "Pełne demo pod /demo - zakupy, obowiązki i notatki reagują lokalnie, bez zapisu w bazie",
        "Przycisk „Wypróbuj demo” w hero i link Demo w nawigacji",
      ],
      en: [
        "Demo section on / previews the dashboard and all modules without login",
        "Full demo at /demo - shopping, chores, and notes react locally with no database writes",
        "“Try the demo” hero button and Demo link in the navbar",
      ],
    },
  },
  {
    version: "0.9.7",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa przeskakiwania ilości w liście zakupowej",
      en: "Fix shopping list quantity jumping on rapid taps",
    },
    changes: {
      pl: [
        "Szybkie klikanie +/- zbiera zmiany i wysyła jedną synchronizację zamiast wielu równoległych requestów",
        "Realtime nie nadpisuje lokalnej ilości przestarzałymi wartościami podczas edycji",
      ],
      en: [
        "Rapid +/- taps batch into one sync instead of many parallel requests",
        "Realtime no longer overwrites local quantity with stale values during edits",
      ],
    },
  },
  {
    version: "0.9.6",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa zapisu ustawienia szybkiego dodawania",
      en: "Fix quick-add setting persistence",
    },
    changes: {
      pl: [
        "Zapis quick_add_enabled weryfikuje odpowiedź bazy i pokazuje błąd przy niepowodzeniu",
        "Po zapisie profil jest odświeżany z serwera",
      ],
      en: [
        "quick_add_enabled save verifies DB response and surfaces errors on failure",
        "Profile refreshes from server after a successful save",
      ],
    },
  },
  {
    version: "0.9.5",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Szybkie dodawanie: pełniejsze formularze i ustawienie profilu",
      en: "Quick add: richer forms and profile setting",
    },
    changes: {
      pl: [
        "Obowiązki: termin i przypisanie osoby w szybkim dodawaniu",
        "Notatki: kategoria i widoczność rodzinna w szybkim dodawaniu",
        "Profil: opcja włączenia/wyłączenia szybkiego dodawania (Ctrl+K i +)",
      ],
      en: [
        "Chores: due date and assignee in quick add",
        "Notes: category and family visibility in quick add",
        "Profile: toggle to enable or disable quick add (Ctrl+K and +)",
      ],
    },
  },
  {
    version: "0.9.4",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Szybkie dodawanie: lista i kategoria zakupów",
      en: "Quick add: shopping list and category",
    },
    changes: {
      pl: [
        "Szybkie dodawanie produktu: wybór listy zakupów i opcjonalnej kategorii",
      ],
      en: [
        "Quick-add shopping item: pick target list and optional category",
      ],
    },
  },
  {
    version: "0.9.3",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Spójna typografia: zwykły myślnik",
      en: "Consistent typography: plain hyphen",
    },
    changes: {
      pl: [
        "Wszystkie teksty w aplikacji: długie myślniki zastąpione zwykłym -",
        "Zasada w regułach repo: nie używać em dash ani en dash w copy",
      ],
      en: [
        "All in-app copy: long dashes replaced with plain hyphen (-)",
        "Repo rule added: do not use em dash or en dash in copy",
      ],
    },
  },
  {
    version: "0.9.2",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Kalendarz rodziny i większe szybkie dodawanie",
      en: "Family calendar and larger quick-add modal",
    },
    changes: {
      pl: [
        "Kalendarz rodziny: breadcrumbs jak w innych modułach",
        "Szybkie dodawanie (Ctrl+K / +): szerszy modal i czytelniejsze przyciski opcji",
        "Na mobile w kalendarzu rodziny ukryty przycisk + - tylko podgląd",
      ],
      en: [
        "Family calendar: breadcrumbs matching other modules",
        "Quick add (Ctrl+K / +): wider modal and clearer action buttons",
        "Family calendar on mobile hides the + button - view only",
      ],
    },
  },
  {
    version: "0.9.1",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Kalendarz rodziny, szybkie dodawanie i panel „Dziś”",
      en: "Family calendar, quick add, and Today panel",
    },
    changes: {
      pl: [
        "Kalendarz rodziny (/calendar): urodziny, grafik i obowiązki w jednym widoku",
        "Szybkie dodawanie: Ctrl+K oraz przycisk + na mobile (obowiązek, notatka, produkt)",
        "Panel „Dziś” na dashboardzie obok „Wymaga uwagi”",
        "Push: grupowanie powiadomień od tej samej osoby w module (okno 2 min)",
        "Testy integracyjne widoczności multi-user (migracja 048)",
      ],
      en: [
        "Family calendar (/calendar): birthdays, schedule, and chores in one view",
        "Quick add: Ctrl+K and mobile + button (chore, note, shopping item)",
        "“Today” panel on the dashboard next to “Needs attention”",
        "Push: batch notifications from the same actor in a module (2 min window)",
        "Multi-user visibility integration tests (migration 048)",
      ],
    },
  },
  {
    version: "0.9.0",
    date: "2026-07-12",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Uzupełnienie modułów, naprawy i dostępność",
      en: "Module completeness, fixes, and accessibility",
    },
    changes: {
      pl: [
        "Budżet: edycja wpisów; RLS budżetów zgodny z dostępem członków",
        "Zakupy: edycja pozycji (treść i kategoria); notatki: edycja/usuwanie kategorii",
        "Zwierzęta: usuwanie pupila; restauracje: szybka zmiana statusu wizyty",
        "Obowiązki: cofnięcie ukończenia terminu; urodziny: opcjonalny rok i wiek",
        "Powiadomienia: usuwanie z listy; apteczka: edycja przez przypisaną osobę",
        "Push: wyłączenie synchronizuje profil; włączenie nie nadpisuje wyłączonych modułów",
        "Naprawa hydracji nawigacji mobile; etykiety delete i focus dla czytników ekranu",
        "Dalszy polish wizualny: akcenty modułów, kontrast, pierścienie obramowań",
      ],
      en: [
        "Budget: edit entries; budget RLS aligned with member access",
        "Shopping: edit items (content and category); notes: edit/delete categories",
        "Pets: delete pet; restaurants: quick visit-status toggle",
        "Chores: undo occurrence completion; birthdays: optional year and age",
        "Notifications: dismiss from list; medicine: assignee can edit items",
        "Push: disable syncs profile; enable no longer overwrites opted-out modules",
        "Mobile nav hydration fix; delete aria-labels and focus rings for screen readers",
        "Further visual polish: module accents, contrast, overlay borders",
      ],
    },
  },
  {
    version: "0.8.3",
    date: "2026-07-10",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Czytelniejszy wygląd i unikalne kolory modułów",
      en: "Improved readability and distinct module colors",
    },
    changes: {
      pl: [
        "Wyższy kontrast tekstu pomocniczego, cieplejsze tło w jasnym motywie i wyraźniejsze karty w ciemnym",
        "Każdy moduł na dashboardzie ma własny kolor akcentu (m.in. obowiązki, notatki, zwierzęta)",
        "Domyślny motyw: system (jasny/ciemny według urządzenia)",
        "Wyraźniejsze obramowania kart, dolna nawigacja na mobile i opisy w kartach",
      ],
      en: [
        "Higher contrast for secondary text, warmer light background, clearer card separation in dark mode",
        "Each dashboard module has a unique accent color (incl. chores, notes, pets)",
        "Default theme: system (follows device light/dark preference)",
        "Clearer card borders, mobile bottom nav, and card descriptions",
      ],
    },
  },
  {
    version: "0.8.2",
    date: "2026-07-10",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Landing i rejestracja: push zamiast informacji o karcie",
      en: "Landing and register: push instead of credit-card copy",
    },
    changes: {
      pl: [
        "Strona główna: usunięto wzmianki o karcie kredytowej i kartach dashboardu - w zamian copy o push i powiadomieniach per moduł",
        "Rejestracja: podtytuł o powiadomieniach i push zamiast „bez karty kredytowej”",
      ],
      en: [
        "Homepage: removed credit-card and dashboard-card mentions - replaced with push and per-module notification copy",
        "Register: subtitle about alerts and push instead of “no credit card required”",
      ],
    },
  },
  {
    version: "0.8.1",
    date: "2026-07-10",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Push do przypisanego i Nimbus na mobile",
      en: "Assignee push and mobile Nimbus menu",
    },
    changes: {
      pl: [
        "Push do innego członka rodziny: serwer czyta jego preferencje modułu (RLS blokowało push_enabled)",
        "Menu Nimbusa na telefonie: naprawione pozycjonowanie arkusza nad dolną nawigacją",
      ],
      en: [
        "Push to another family member: server reads their module prefs (RLS blocked push_enabled)",
        "Nimbus menu on mobile: fixed sheet positioning above the bottom nav",
      ],
    },
  },
  {
    version: "0.8.0",
    date: "2026-07-10",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Widoczność przypisań w rodzinie",
      en: "Family assignee visibility",
    },
    changes: {
      pl: [
        "Obowiązki i apteczka: przypisane wpisy widzi tylko osoba przypisana i autor (nieprzypisane - cała rodzina)",
        "Budżet: ograniczenie do wybranych członków działa w RLS; prezenty dla członka rodziny domyślnie tylko dla niego",
        "Powiadomienia i digest e-mail respektują te same zasady widoczności",
      ],
      en: [
        "Chores and medicine: assigned items visible only to assignee and creator (unassigned - whole family)",
        "Budget: selected-member restriction enforced in RLS; family-member gifts default to recipient-only visibility",
        "Notifications and email digest follow the same visibility rules",
      ],
    },
  },
  {
    version: "0.7.8",
    date: "2026-07-10",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa powiadomień push PWA",
      en: "PWA push notification fix",
    },
    changes: {
      pl: [
        "Ustawienia → Powiadomienia: przycisk subskrypcji push na telefonie (wcześniej niedostępny po odrzuceniu banera)",
        "Po włączeniu push automatycznie aktywuje się kanał globalny i push we wszystkich modułach",
      ],
      en: [
        "Settings → Notifications: on-device push subscribe button (previously missing after dismissing the banner)",
        "Enabling push now auto-activates the global channel and push for all modules",
      ],
    },
  },
  {
    version: "0.7.7",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa crashy PWA splash na /login",
      en: "PWA splash crash fix on /login",
    },
    changes: {
      pl: [
        "Statyczny splash PWA jest tylko chowany (CSS), nie usuwany z DOM - koniec z błędem removeChild/insertBefore przy starcie",
      ],
      en: [
        "Static PWA splash is hidden via CSS only, not removed from the DOM - fixes removeChild/insertBefore errors on startup",
      ],
    },
  },
  {
    version: "0.7.6",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa removeChild przy nawigacji",
      en: "removeChild navigation fix",
    },
    changes: {
      pl: [
        "Dolna nawigacja i overlay przejścia bez useSearchParams - shell nie jest odmontowywany przy zmianie trasy",
        "Usunięto auto-reset error boundary podczas nawigacji (konflikt DOM)",
      ],
      en: [
        "Bottom nav and transition overlay no longer use useSearchParams - shell stays mounted on route changes",
        "Removed auto-reset error boundary during navigation (DOM conflict)",
      ],
    },
  },
  {
    version: "0.7.5",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Naprawa crashy przy nawigacji",
      en: "Navigation crash fix",
    },
    changes: {
      pl: [
        "Dolna nawigacja mobile: usunięty portal do body - koniec z błędem hydracji przy przejściach między ekranami",
        "Strony błędów: twarde przeładowanie przy zmianie trasy i komunikat błędu w UI",
      ],
      en: [
        "Mobile bottom nav: removed body portal - fixes hydration crash when switching screens",
        "Error pages: hard reload on route change and error message shown in the UI",
      ],
    },
  },
  {
    version: "0.7.4",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Usunięcie Sentry",
      en: "Sentry removed",
    },
    changes: {
      pl: [
        "Wyłączono integrację Sentry i tunel /monitoring - mniej requestów przy nawigacji",
        "Strony błędów zostają z i18n PL/EN i twardym odświeżeniem aplikacji",
      ],
      en: [
        "Removed Sentry integration and the /monitoring tunnel - fewer requests on navigation",
        "Error pages keep PL/EN i18n and a hard app reload action",
      ],
    },
  },
  {
    version: "0.7.3",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "iOS PWA: layout zakupów i ekran startowy",
      en: "iOS PWA: shopping layout and startup screen",
    },
    changes: {
      pl: [
        "Lista zakupów na mobile: wyższy tytuł sheeta i stopka „Dodaj nowy produkt” nad zaokrąglonymi rogami iPhone",
        "PWA: ciemne tło zamiast białego ekranu przy starcie; loader z logo do momentu załadowania aplikacji",
      ],
      en: [
        "Mobile shopping list: higher sheet title and “Add new product” footer clearance above iPhone rounded corners",
        "PWA: dark startup background instead of a white flash; logo loader until the app finishes loading",
      ],
    },
  },
  {
    version: "0.7.2",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Mobile: zakupy, urodziny i kategorie dla admina",
      en: "Mobile shopping, birthdays, and admin categories",
    },
    changes: {
      pl: [
        "Zakupy na mobile: pełnoekranowy widok listy z nazwą; plus otwiera dialog dodawania produktu z wyborem kategorii",
        "Urodziny na mobile: lista w accordionie nad kalendarzem; pełne etykiety dni i tygodni; klik w zajęty kafelek otwiera edycję",
        "Kategorie zakupów: zarządzanie także dla administratora rodziny (nie tylko założyciel)",
        "Kalendarz modułów: zakres tygodnia z odstępami przy myślniku (np. 6 - 12 Lipiec)",
      ],
      en: [
        "Mobile shopping: full-screen list detail with name; plus opens add-product dialog with category picker",
        "Mobile birthdays: collapsible list above calendar; full day/week labels; tap occupied day tile to edit",
        "Shopping categories: family admins can manage categories, not only the founder",
        "Module calendars: spaced week range labels (e.g. 6 - 12 July)",
      ],
    },
  },
  {
    version: "0.7.1",
    date: "2026-07-08",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "Mniejsze zużycie baterii w PWA na iOS",
      en: "Lower PWA battery use on iOS",
    },
    changes: {
      pl: [
        "Mobile/PWA: statyczne tło zamiast animowanych blobów i blur",
        "Wstrzymanie animacji Nimbus, timerów i realtime powiadomień w tle",
        "Wyszukiwarka globalna nie subskrybuje wszystkich modułów, gdy jest zamknięta",
        "Zakupy: zmiana nazwy i usunięcie listy synchronizują się na żywo w rodzinie",
        "Kalendarz modułów: na mobile widok tygodniowy z dużymi kafelkami dni",
      ],
      en: [
        "Mobile/PWA: static background instead of animated blobs and blur",
        "Pause Nimbus animations, timers, and notification realtime while backgrounded",
        "Global search no longer subscribes to all module stores when closed",
        "Shopping: list rename and delete sync live for family members",
        "Module calendars: weekly mobile view with large day tiles",
      ],
    },
  },
  {
    version: "0.7.0",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Rodzina, notatki i szybszy panel",
      en: "Family page, notes, and faster dashboard",
    },
    changes: {
      pl: [
        "Strona /family - zarządzanie rodziną poza ustawieniami profilu",
        "Notatki: Markdown, przypinanie i załączniki (obrazy/PDF do 5 MB)",
        "Kategorie zakupów także na kontach solo",
        "Powiadomienia: godziny ciszy push i tygodniowy digest e-mail (poniedziałek)",
        "Dashboard ładuje powiadomienia, kategorie i pozycje list zakupów; lazy search",
        "Skeletony stron modułów; cookie onboardingu czyszczone przy wylogowaniu",
      ],
      en: [
        "New /family page - manage family outside profile settings",
        "Notes: Markdown, pinning, and attachments (images/PDF up to 5 MB)",
        "Shopping categories on solo accounts too",
        "Notifications: push quiet hours and weekly email digest (Mondays)",
        "Dashboard prefetch includes notifications, categories, and list items; lazy search",
        "Module page skeletons; onboarding cookie cleared on logout",
      ],
    },
  },
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
        "PWA i Nimbus ładowane dynamicznie - mniejszy initial JS na pierwszym malowaniu",
      ],
      en: [
        "Static landing and marketing without blocking cookies() in the root layout",
        "Middleware: fewer Supabase calls on public paths and cached onboarding status",
        "Fonts with display: swap; dashboard with one server fetch and CLS-friendly skeleton",
        "PWA and Nimbus loaded dynamically - smaller initial JS on first paint",
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
        "Docelowa strona pojawia się dopiero po załadowaniu - z miękkim fade-out",
      ],
      en: [
        "Full-screen loader with pulsing logo during in-app navigation",
        "Destination page appears only after load - with a soft fade-out",
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
        "Poprawka notify-family - sprawdzanie błędu RPC przed pushem",
        "ESLint wymusza importy @/ zamiast ../ w kodzie produkcyjnym",
        "Yarn jako menedżer pakietów (yarn.lock, CI i dokumentacja)",
        "Sentry aktywny tylko na produkcji - szybszy yarn dev",
        "Usunięte podpisy „wkrótce” i placeholdery funkcji w UI",
      ],
      en: [
        "Notification bell updates live via Supabase Realtime",
        "Profile preferences: server push and daily email digest",
        "Push deep links to shopping lists (/shopping?list=…) and budgets",
        "notify-family fix - RPC error check before push dispatch",
        "ESLint enforces @/ imports instead of ../ in production code",
        "Yarn as package manager (yarn.lock, CI, and docs)",
        "Sentry enabled only in production - faster yarn dev",
        "Removed “coming soon” teasers and placeholder copy in the UI",
      ],
    },
  },
  {
    version: "0.5.3",
    date: "2026-06-28",
    type: CHANGELOG_ENTRY_TYPE.MINOR,
    title: {
      pl: "Sentry - śledzenie błędów",
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
        "Vercel Web Analytics - ruch i odwiedziny w panelu Vercel",
        "Vercel Speed Insights - metryki wydajności (Core Web Vitals) na produkcji",
      ],
      en: [
        "Vercel Web Analytics - traffic and visits in the Vercel dashboard",
        "Vercel Speed Insights - performance metrics (Core Web Vitals) in production",
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
        "iOS - stabilniejsza subskrypcja push (service worker, walidacja VAPID, ponowna próba)",
        "Push na Vercel - await wysyłki przed zakończeniem server action",
        "Listy zakupów i budżet - powiadomienia dla obserwatorów (RPC create_watcher_notifications, migracja 039)",
        "Naprawa RLS - serwer widzi wszystkich obserwatorów listy, nie tylko aktora",
        "Poprawka VAPID subject (mailto:) przy wysyłce push",
      ],
      en: [
        "iOS - more reliable push subscribe (service worker, VAPID validation, retry)",
        "Push on Vercel - await dispatch before server action exits",
        "Shopping lists and budget - watcher notifications (create_watcher_notifications RPC, migration 039)",
        "RLS fix - server loads all list watchers, not only the actor",
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
        "Web Push po zainstalowaniu aplikacji - Android i iOS 16.4+ z ekranu głównego",
        "Włączanie w ustawieniach profilu i baner po instalacji PWA",
        "Push przy powiadomieniach rodzinnych i przypomnieniach budżetu",
        "Klucze VAPID (yarn push:vapid) - migracja push_subscriptions",
      ],
      en: [
        "Web Push after installing the app - Android and iOS 16.4+ from the home screen",
        "Enable in profile settings and prompt after PWA install",
        "Push for family notifications and budget payment reminders",
        "VAPID keys (yarn push:vapid) - push_subscriptions migration",
      ],
    },
  },
  {
    version: "0.4.3",
    date: "2026-06-27",
    type: CHANGELOG_ENTRY_TYPE.FIX,
    title: {
      pl: "PWA - ikona na ekranie głównym iOS",
      en: "PWA - iOS home screen icon",
    },
    changes: {
      pl: [
        "Ikony PNG (180, 192, 512 px) i apple-touch-icon - iOS nie obsługuje SVG na ekranie głównym",
        "Manifest i metadane strony wskazują na PNG zamiast samego SVG",
        "Skrypt yarn pwa:icons do regeneracji ikon z public/pwa-icon.svg",
      ],
      en: [
        "PNG icons (180, 192, 512 px) and apple-touch-icon - iOS does not use SVG on the home screen",
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
      pl: "Nimbus - toury na driver.js",
      en: "Nimbus - tours on driver.js",
    },
    changes: {
      pl: [
        "Przewodniki Nimbusa korzystają z driver.js zamiast własnego overlay",
        "Popover touru: avatar, nagłówek z nazwą kroku, ramka ze skrótami klawiatury",
        "Skróty A/D i strzałki do nawigacji między krokami; Esc - pauza touru",
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
      pl: "Nimbus - towarzysz po aplikacji",
      en: "Nimbus - your in-app companion",
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
