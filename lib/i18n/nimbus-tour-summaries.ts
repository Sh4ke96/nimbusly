import type { Dict } from "@/lib/i18n/types";

type SummaryCopy = Dict["nimbusTour"]["modules"][string]["summary"];

function summary(
  title: string,
  body: string,
  learned: string[],
  next: string[]
): SummaryCopy {
  return { title, body, learned, next };
}

export const nimbusModuleSummariesPl: Record<string, SummaryCopy> = {
  budget: summary(
    "Budżet - podsumowanie",
    "Masz już obraz modułu budżetu. Oto skrót tego, co warto zapamiętać.",
    [
      "Tworzysz osobne budżety i wybierasz aktywny z listy.",
      "Wpisy miesięczne pokazują przychody, wydatki i saldo.",
      "Filtry pomagają szybko znaleźć konkretne transakcje.",
    ],
    [
      "Dodaj pierwszy budżet i wpisy na bieżący miesiąc.",
      "Ustaw daty ważności leków w apteczce - uzupełni to domowy obraz finansów i zdrowia.",
      "Wróć do Nimbusa po krótki przewodnik po innym module.",
    ]
  ),
  shopping: summary(
    "Zakupy - podsumowanie",
    "Listy zakupów są gotowe do użycia - solo lub w rodzinie na żywo.",
    [
      "Każda lista ma własne produkty do odhaczania.",
      "Rodzina widzi zmiany na liście w czasie rzeczywistym.",
      "Eksport CSV pomaga zabrać listę poza aplikację.",
    ],
    [
      "Utwórz listę i dodaj kilka produktów.",
      "Spróbuj obowiązków domowych, by dzielić zadania z rodziną.",
      "Przypnij listę do obserwowanych z dashboardu.",
    ]
  ),
  gifts: summary(
    "Prezenty - podsumowanie",
    "Moduł prezentów zbiera pomysły, zanim znikną z pamięci.",
    [
      "Pomysły można filtrować po odbiorcy.",
      "Notatki i linki trzymasz przy każdym pomyśle.",
      "Rodzina może współtworzyć listę prezentów.",
    ],
    [
      "Dodaj pierwszy pomysł z odbiorcą.",
      "Uzupełnij urodziny bliskich - łatwiej planować sezon prezentowy.",
      "Oznaczaj kupione prezenty, gdy sezon ruszy.",
    ]
  ),
  birthdays: summary(
    "Urodziny - podsumowanie",
    "Daty urodzin są pod kontrolą - kalendarz i lista nadchodzących.",
    [
      "Kalendarz pokazuje urodziny w kontekście miesiąca.",
      "Lista po prawej sortuje najbliższe daty.",
      "Przypomnienia pojawią się na dashboardzie.",
    ],
    [
      "Dodaj urodziny najbliższych osób.",
      "Połącz z modułem prezentów na pomysły upominków.",
      "Sprawdź harmonogram - unikniesz kolizji z wydarzeniami.",
    ]
  ),
  schedule: summary(
    "Grafik - podsumowanie",
    "Harmonogram łączy wydarzenia jedno- i wielodniowe w jednym kalendarzu.",
    [
      "Kalendarz i lista miesiąca uzupełniają się nawzajem.",
      "Wpisy mogą mieć zakres dat i opis.",
      "Wydruk miesiąca pomaga na spotkaniach rodzinnych.",
    ],
    [
      "Dodaj najbliższe wydarzenie lub wyjazd.",
      "Uzupełnij urodziny - łatwiej planować wspólny czas.",
      "Sprawdź panel „Wymaga uwagi” na dashboardzie.",
    ]
  ),
  familyCalendar: summary(
    "Kalendarz rodziny - podsumowanie",
    "Wspólny miesiąc z urodzinami, grafikiem i obowiązkami.",
    [
      "Legenda kolorów rozróżnia typ wydarzenia.",
      "Kliknięcie wpisu prowadzi do właściwego modułu.",
      "Baner „Dziś” na dashboardzie też linkuje tutaj.",
    ],
    [
      "Dodaj urodziny lub wpis w grafiku, aby zobaczyć je tutaj.",
      "Odhacz obowiązek - pojawi się w kalendarzu w terminie.",
    ]
  ),
  medicine: summary(
    "Apteczka - podsumowanie",
    "Domowa apteczka z datami ważności i filtrowaniem.",
    [
      "Każdy lek ma formę, ilość i termin ważności.",
      "Filtry ułatwiają szukanie po lokalizacji lub stanie.",
      "Zbliżające się terminy trafiają do „Wymaga uwagi”.",
    ],
    [
      "Dodaj podstawowe leki z datami ważności.",
      "Połącz z budżetem na śledzenie wydatków zdrowotnych.",
      "Aktualizuj ilości po zużyciu opakowań.",
    ]
  ),
  watchlist: summary(
    "Watchlista - podsumowanie",
    "Filmy i seriale w jednej liście - solo lub wspólnie.",
    [
      "Status obejrzane / do obejrzenia trzyma porządek.",
      "Filtry platform pomagają przy wyborze wieczoru.",
      "Rodzina może dopisywać tytuły na wspólną listę.",
    ],
    [
      "Dodaj tytuł, który chcesz obejrzeć w tym tygodniu.",
      "Oznacz obejrzane po seansie.",
      "Użyj restauracji, by zapisać miejsce na wieczór filmowy.",
    ]
  ),
  restaurants: summary(
    "Restauracje - podsumowanie",
    "Zapisuj lokale do odwiedzenia i notatki po wizycie.",
    [
      "Filtry sortują po typie lokalu i statusie wizyty.",
      "Adres i notatki są przy każdym miejscu.",
      "Lista działa też jako pamiętnik kulinarnych odkryć.",
    ],
    [
      "Dodaj miejsce, które chcesz odwiedzić.",
      "Po wizycie uzupełnij notatki i ocenę.",
      "Połącz z watchlistą na wieczór w mieście.",
    ]
  ),
  pets: summary(
    "Zwierzęta - podsumowanie",
    "Opieka nad pupilem - zwierzęta, zadania i terminy.",
    [
      "Każde zwierzę ma własne zadania opieki.",
      "Szczepienia i wizyty weterynaryjne mają terminy.",
      "Filtry pomagają skupić się na jednym pupilu.",
    ],
    [
      "Dodaj pupila i pierwsze zadanie opieki.",
      "Uzupełnij apteczkę na podstawowe leki weterynaryjne.",
      "Sprawdź zaległe terminy na dashboardzie.",
    ]
  ),
  chores: summary(
    "Obowiązki - podsumowanie",
    "Domowe zadania z przypisaniem i powtarzalnością.",
    [
      "Zadania można przypisać członkom rodziny.",
      "Lista i kalendarz pokazują to samo z innej perspektywy.",
      "Odhaczenie wykonania jest jednym kliknięciem.",
    ],
    [
      "Dodaj pierwszy obowiązek z terminem.",
      "Przypisz zadanie konkretnej osobie w rodzinie.",
      "Połącz z listą zakupów na wspólne zaopatrzenie.",
    ]
  ),
  notes: summary(
    "Notatki - podsumowanie",
    "Wspólne notatki z kategoriami i pilnością.",
    [
      "Kategorie porządkują notatki kolorem.",
      "Tytuł z ! trafia do „Wymaga uwagi”.",
      "Rodzina widzi notatki na żywo.",
    ],
    [
      "Utwórz kategorię i pierwszą notatkę.",
      "Użyj ! przy pilnych sprawach domowych.",
      "Przypnij ważne notatki na górze listy.",
    ]
  ),
  notifications: summary(
    "Powiadomienia - podsumowanie",
    "Skrzynka aktywności rodziny i aplikacji w jednym miejscu.",
    [
      "Filtry dzielą wpisy na wszystkie, nieprzeczytane i przeczytane.",
      "Kliknięcie prowadzi do modułu źródłowego.",
      "Możesz oznaczyć wszystkie jako przeczytane.",
    ],
    [
      "Sprawdzaj nieprzeczytane po logowaniu.",
      "Włącz powiadomienia w przeglądarce, jeśli chcesz alerty poza aplikacją.",
      "Wróć do dashboardu - „Wymaga uwagi” pokazuje terminy.",
    ]
  ),
  settingsSolo: summary(
    "Konto solo - podsumowanie",
    "Ustawienia konta indywidualnego - dołączenie do rodziny, założenie własnej i bezpieczeństwo.",
    [
      "Typ konta wybierasz przy rejestracji - później tylko podgląd.",
      "Kod zaproszenia lub formularz „Załóż rodzinę” w zakładce Typ konta.",
      "Hasło zmieniasz w dedykowanej sekcji.",
    ],
    [
      "Dołącz do rodziny kodem lub załóż własną grupę.",
      "Po wejściu w rodzinę uruchom tour konta rodzinnego.",
      "Włącz tryb cichy Nimbusa, jeśli wolisz mniej podpowiedzi.",
    ]
  ),
};

export const nimbusModuleSummariesEn: Record<string, SummaryCopy> = {
  budget: summary(
    "Budget - summary",
    "You now know the budget module. Here's what to remember.",
    [
      "Create separate budgets and pick the active one from the list.",
      "Monthly entries show income, expenses, and balance.",
      "Filters help you find specific transactions quickly.",
    ],
    [
      "Add your first budget and entries for this month.",
      "Set medicine expiry dates in the cabinet - it completes the household picture.",
      "Ask Nimbus for a tour of another module anytime.",
    ]
  ),
  shopping: summary(
    "Shopping - summary",
    "Shopping lists are ready - solo or live with family.",
    [
      "Each list has its own items to check off.",
      "Family sees list changes in real time.",
      "CSV export takes the list outside the app.",
    ],
    [
      "Create a list and add a few products.",
      "Try chores to split household tasks in the family.",
      "Watch a list from the dashboard for quick access.",
    ]
  ),
  gifts: summary(
    "Gifts - summary",
    "The gifts module collects ideas before they slip away.",
    [
      "Filter ideas by recipient.",
      "Keep notes and links with each idea.",
      "Family can co-manage the gift list.",
    ],
    [
      "Add your first idea with a recipient.",
      "Fill in birthdays - easier gift season planning.",
      "Mark bought gifts when the season starts.",
    ]
  ),
  birthdays: summary(
    "Birthdays - summary",
    "Birthday dates are under control - calendar and upcoming list.",
    [
      "The calendar shows birthdays in month context.",
      "The side list sorts nearest dates.",
      "Reminders surface on the dashboard.",
    ],
    [
      "Add birthdays for close family and friends.",
      "Link with gifts for present ideas.",
      "Check schedule to avoid event clashes.",
    ]
  ),
  schedule: summary(
    "Schedule - summary",
    "The schedule combines single- and multi-day events in one calendar.",
    [
      "Calendar and month list complement each other.",
      "Entries can have date ranges and descriptions.",
      "Print the month for family planning meetings.",
    ],
    [
      "Add your next event or trip.",
      "Add birthdays - easier to plan shared time.",
      "Check Needs attention on the dashboard.",
    ]
  ),
  familyCalendar: summary(
    "Family calendar - summary",
    "One month view for birthdays, schedule, and chores together.",
    [
      "Color legend shows event types at a glance.",
      "Clicking an entry opens the source module.",
      "The dashboard Today banner links here too.",
    ],
    [
      "Add birthdays or schedule entries to populate the month.",
      "Complete chores to see them on their due dates.",
    ]
  ),
  medicine: summary(
    "Medicine cabinet - summary",
    "Home medicine tracking with expiry dates and filters.",
    [
      "Each medicine has form, quantity, and expiry.",
      "Filters help by location or availability.",
      "Upcoming expiries appear in Needs attention.",
    ],
    [
      "Add basic medicines with expiry dates.",
      "Link with budget for health spending.",
      "Update quantities when packages run out.",
    ]
  ),
  watchlist: summary(
    "Watchlist - summary",
    "Movies and series in one list - solo or shared.",
    [
      "Watched / to-watch status keeps things tidy.",
      "Platform filters help pick a evening show.",
      "Family can add titles to a shared list.",
    ],
    [
      "Add a title you want to watch this week.",
      "Mark watched after viewing.",
      "Use restaurants to save a spot for movie night.",
    ]
  ),
  restaurants: summary(
    "Restaurants - summary",
    "Save places to visit and notes after dining.",
    [
      "Filters sort by venue type and visit status.",
      "Address and notes stay with each place.",
      "The list works as a food discovery journal.",
    ],
    [
      "Add a place you want to try.",
      "Update notes and rating after your visit.",
      "Pair with the watchlist for a night out.",
    ]
  ),
  pets: summary(
    "Pets - summary",
    "Pet care - animals, tasks, and due dates.",
    [
      "Each pet has its own care tasks.",
      "Vaccines and vet visits have due dates.",
      "Filters focus on one pet at a time.",
    ],
    [
      "Add your pet and first care task.",
      "Fill the medicine cabinet for basic vet supplies.",
      "Check overdue items on the dashboard.",
    ]
  ),
  chores: summary(
    "Chores - summary",
    "Household tasks with assignment and recurrence.",
    [
      "Tasks can be assigned to family members.",
      "List and calendar show the same data differently.",
      "Completing a task takes one click.",
    ],
    [
      "Add your first chore with a due date.",
      "Assign a task to a family member.",
      "Pair with shopping lists for shared supplies.",
    ]
  ),
  notes: summary(
    "Notes - summary",
    "Shared notes with categories and urgency.",
    [
      "Categories organize notes by color.",
      "A ! title prefix sends notes to Needs attention.",
      "Family sees notes live.",
    ],
    [
      "Create a category and your first note.",
      "Use ! for urgent household matters.",
      "Pin important notes to the top.",
    ]
  ),
  notifications: summary(
    "Notifications - summary",
    "Family and app activity inbox in one place.",
    [
      "Filters split all, unread, and read entries.",
      "Clicking opens the source module.",
      "You can mark all as read.",
    ],
    [
      "Check unread after sign-in.",
      "Enable browser notifications if you want alerts outside the app.",
      "Return to the dashboard - Needs attention shows due items.",
    ]
  ),
  settingsSolo: summary(
    "Solo account - summary",
    "Individual account settings - joining a family, creating your own, and security.",
    [
      "Account type is chosen at sign-up - later it's read-only.",
      "Invite code or Create family form on the Account type tab.",
      "Change your password in the dedicated section.",
    ],
    [
      "Join a family with a code or start your own group.",
      "After joining a family, run the family account tour.",
      "Enable Nimbus quiet mode if you prefer fewer hints.",
    ]
  ),
};

export const nimbusFamilyTourPl: Dict["nimbusTour"]["family"] = {
  members: {
    title: "Zaproszenia i nazwa",
    body: "Zmień nazwę rodziny, wyślij zaproszenie mailem lub udostępnij kod - nowi członkowie dołączą do wspólnego konta.",
  },
  memberRoles: {
    title: "Członkowie i role",
    body: "Administrator nadaje role i usuwa członków. Założyciel może przekazać swoją rolę innemu - wtedy może opuścić rodzinę.",
  },
  leaveFamily: {
    title: "Opuść rodzinę",
    body: "Wrócisz na konto solo. Założyciel z innymi członkami musi najpierw przekazać rolę założyciela.",
  },
  realtime: {
    title: "Współdzielenie na żywo",
    body: "W modułach rodzinnych zmiany synchronizują się od razu - np. lista zakupów przy telefonie i komputerze.",
  },
  summary: {
    title: "Konto rodzinne - podsumowanie",
    body: "Wspólne konto to współdzielone moduły, zarządzanie członkami i synchronizacja na żywo.",
    learned: [
      "Zarządzaj rodziną łączy zaproszenia, role i członków w jednym miejscu.",
      "Administratorzy kontrolują role; założyciel przekazuje własność przed opuszczeniem.",
      "Listy, notatki i obowiązki aktualizują się w czasie rzeczywistym.",
    ],
    next: [
      "Zaproś brakujących członków rodziny.",
      "Ustal role pod swój model współpracy.",
      "Zacznij od wspólnej listy zakupów lub obowiązków.",
    ],
  },
};

export const nimbusFamilyTourEn: Dict["nimbusTour"]["family"] = {
  members: {
    title: "Invites and name",
    body: "Rename the family, send email invites, or share your code - new members join the shared account.",
  },
  memberRoles: {
    title: "Members and roles",
    body: "Admins assign roles and remove members. The founder can transfer ownership - then leave the family.",
  },
  leaveFamily: {
    title: "Leave family",
    body: "You'll return to a solo account. A founder with other members must transfer founder role first.",
  },
  realtime: {
    title: "Live sharing",
    body: "Family modules sync instantly - e.g. a shopping list on phone and desktop.",
  },
  summary: {
    title: "Family account - summary",
    body: "A family account means shared modules, member management, and live sync.",
    learned: [
      "Manage family combines invites, roles, and members in one place.",
      "Admins control roles; the founder transfers ownership before leaving.",
      "Lists, notes, and chores update in real time.",
    ],
    next: [
      "Invite any missing family members.",
      "Set roles for how you collaborate.",
      "Start with a shared shopping list or chores.",
    ],
  },
};
