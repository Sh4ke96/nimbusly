import type { Dict } from "@/lib/i18n/types";
import {
  nimbusFamilyTourEn,
  nimbusFamilyTourPl,
  nimbusModuleSummariesEn,
  nimbusModuleSummariesPl,
} from "@/lib/i18n/nimbus-tour-summaries";

type StepCopy = { title: string; body: string };

function step(title: string, body: string): StepCopy {
  return { title, body };
}

const introPl = {
  dashboardGreeting: step(
    "Twój panel startowy",
    "To ekran główny Nimbusly. Tutaj wracasz po zalogowaniu i od razu widzisz, co dzieje się u Ciebie lub w rodzinie."
  ),
  dashboardTabs: step(
    "Podsumowanie i moduły",
    "Przełączaj widok: Podsumowanie zbiera najważniejsze skróty, a Moduły to pełna siatka funkcji."
  ),
  dashboardAttention: step(
    "Wymaga uwagi",
    "Gdy coś zbliża się terminowo — obowiązki, leki, płatności, notatki — pojawi się tu na pierwszy plan."
  ),
  dashboardAttentionPin: step(
    "Przypinanie wpisów",
    "Kliknij pinezkę przy wpisie — zostanie na samej górze listy, dopóki go nie odpińiesz."
  ),
  dashboardOverview: step(
    "Karty podsumowania",
    "Szybki podgląd budżetu, list zakupów, grafiku i innych modułów. Możesz też dostosować układ kart."
  ),
  dashboardLayout: step(
    "Układ kart",
    "W trybie edycji włączasz i ukrywasz karty modułów — dashboard pokazuje tylko to, co Ci potrzebne."
  ),
  dashboardModules: step(
    "Wszystkie moduły",
    "Stąd wejdziesz w każdy moduł: budżet, prezenty, zwierzęta, notatki i resztę narzędzi domowych."
  ),
  globalSearch: step(
    "Wyszukiwarka globalna",
    "Skrót Ctrl+K (Cmd+K na Macu) otwiera wyszukiwarkę — moduły, notatki, listy i inne dane w jednym miejscu."
  ),
  settingsNav: step(
    "Ustawienia konta",
    "W profilu zarządzasz awatarem i Nimbusem. W Typ konta dołączysz lub założysz rodzinę. W Zarządzaj rodziną — członkami, rolami i zaproszeniami."
  ),
  settingsProfile: step(
    "Profil i Nimbus",
    "Tu zmieniasz imię, kolor avatara i decydujesz, czy Nimbus ma Ci towarzyszyć."
  ),
};

const introEn = {
  dashboardGreeting: step(
    "Your home dashboard",
    "This is your Nimbusly home screen — where you land after sign-in and see what's going on."
  ),
  dashboardTabs: step(
    "Summary and modules",
    "Switch views: Summary collects shortcuts; Modules shows the full feature grid."
  ),
  dashboardAttention: step(
    "Needs attention",
    "When something is due soon — chores, medicine, payments, notes — it surfaces here first."
  ),
  dashboardAttentionPin: step(
    "Pin items",
    "Click the pin next to an item to keep it at the very top until you unpin it."
  ),
  dashboardOverview: step(
    "Overview cards",
    "Quick snapshots of budget, shopping, schedule, and more. You can customize the layout."
  ),
  dashboardLayout: step(
    "Card layout",
    "In edit mode you show or hide module cards — the dashboard shows only what you need."
  ),
  dashboardModules: step(
    "All modules",
    "Open every module from here: budget, gifts, pets, notes, and the rest of your toolkit."
  ),
  globalSearch: step(
    "Global search",
    "Press Ctrl+K (Cmd+K on Mac) to search modules, notes, lists, and more in one place."
  ),
  settingsNav: step(
    "Account settings",
    "Manage your avatar and Nimbus in Profile. In Account type, join or create a family. In Manage family — members, roles, and invites."
  ),
  settingsProfile: step(
    "Profile and Nimbus",
    "Update your name, avatar color, and whether Nimbus stays visible."
  ),
};

const modulesPl = {
  budget: {
    header: step("Moduł budżetu", "Tu planujesz domowe finanse — budżety, przychody i wydatki w jednym miejscu."),
    add: step("Nowy budżet", "Kliknij, aby utworzyć budżet np. na dom, wakacje lub stałe rachunki."),
    lists: step("Lista budżetów", "Wybierz budżet z listy po lewej — aktywny jest podświetlony."),
    hidden: step("Ukryte budżety", "Budżety można ukryć z listy — przełącznik pokazuje je ponownie."),
    detail: step("Szczegóły miesiąca", "Podgląd przychodów, wydatków i salda dla wybranego miesiąca."),
    income: step("Przychody", "Dodawaj wpisy przychodów obok wydatków — saldo liczy się automatycznie."),
    filters: step("Filtry i wpisy", "Filtruj wydatki i dodawaj nowe pozycje do aktywnego budżetu."),
    export: step("Eksport i druk", "Pobierz CSV lub wydrukuj zestawienie miesiąca do archiwum."),
    watch: step("Obserwowanie", "Przypnij budżet do dashboardu — szybki podgląd bez wchodzenia w moduł."),
  },
  shopping: {
    header: step("Listy zakupów", "Wspólne listy dla całej rodziny — na telefonie i przy komputerze."),
    add: step("Nowa lista", "Utwórz listę np. na spożywcze, aptekę lub budowę."),
    lists: step("Twoje listy", "Wybierz listę, aby zobaczyć i edytować produkty."),
    items: step("Produkty na liście", "Tu oznaczasz co kupione, dodajesz ilości i kategorie."),
    categories: step("Kategorie rodzinne", "Produkty grupują się w kategorie — założyciel rodziny je konfiguruje."),
    watch: step("Obserwowanie listy", "Przypnij listę do dashboardu, żeby widzieć postęp zakupów."),
    addItem: step("Dodawanie produktu", "Szybko dopisz kolejną pozycję — zostanie na liście do odhaczenia."),
  },
  gifts: {
    header: step("Prezenty", "Zbieraj pomysły na prezenty dla bliskich — bez zapominania."),
    add: step("Nowy pomysł", "Dodaj pomysł z odbiorcą i notatką, zanim Ci umknie."),
    filters: step("Filtry", "Szukaj po odbiorcy lub statusie — łatwiej ogarnąć sezon prezentowy."),
    list: step("Lista pomysłów", "Wszystkie pomysły w jednym miejscu — kupione i planowane."),
  },
  birthdays: {
    header: step("Urodziny", "Pilnuj dat urodzin rodziny i znajomych."),
    add: step("Dodaj urodziny", "Zapisz osobę i datę — Nimbusly przypomni w odpowiednim czasie."),
    calendar: step("Kalendarz", "Widok miesiąca z zaznaczonymi urodzinami."),
    list: step("Nadchodzące", "Lista najbliższych urodzin po prawej stronie."),
  },
  schedule: {
    header: step("Grafik", "Planuj wydarzenia, wyjazdy i obowiązki w kalendarzu."),
    add: step("Nowe wydarzenie", "Dodaj wpis z datą, opisem i ewentualnym zakresem dni."),
    multiday: step("Wielodniowe wpisy", "Ustaw datę końcową — wyjazdy i wydarzenia wielodniowe będą widoczne w kalendarzu."),
    calendar: step("Kalendarz", "Przeglądaj miesiąc i klikaj dni, by zobaczyć szczegóły."),
    list: step("Lista miesiąca", "Chronologiczna lista wydarzeń z bieżącego miesiąca."),
    print: step("Druk grafiku", "Wydrukuj miesiąc — przydatne na lodówkę lub spotkanie rodzinne."),
  },
  medicine: {
    header: step("Apteczka", "Trzymaj leki, daty ważności i lokalizację w jednym miejscu."),
    add: step("Dodaj lek", "Zapisz nazwę, formę, ilość i termin ważności."),
    filters: step("Filtry", "Filtruj po dostępności lub lokalizacji — szybciej znajdziesz to, czego szukasz."),
    list: step("Twoje leki", "Wszystkie pozycje apteczki w przejrzystej siatce."),
  },
  watchlist: {
    header: step("Do obejrzenia", "Lista filmów i seriali — własna lub wspólna z rodziną."),
    add: step("Dodaj tytuł", "Dopisz serial lub film, który chcesz obejrzeć."),
    platforms: step("Platformy", "Przypisz serwisy streamingowe — łatwiej znaleźć gdzie obejrzeć."),
    status: step("Status obejrzane", "Oznacz tytuł jako obejrzany lub do obejrzenia."),
    filters: step("Filtry", "Filtruj po statusie lub platformie streamingowej."),
    list: step("Twoja lista", "Wszystkie tytuły z oznaczeniem obejrzane / do obejrzenia."),
  },
  restaurants: {
    header: step("Restauracje", "Zapisuj miejsca, które chcesz odwiedzić lub które polecasz."),
    add: step("Dodaj miejsce", "Dodaj nazwę, adres i własne notatki po wizycie."),
    filters: step("Filtry", "Szukaj po typie lokalu lub statusie wizyty."),
    list: step("Twoje miejsca", "Lista zapisanych restauracji i ocen."),
  },
  pets: {
    header: step("Zwierzęta", "Opieka nad pupilem — szczepienia, wizyty i codzienne obowiązki."),
    add: step("Dodaj zwierzę", "Zapisz pupila, aby przypinać do niego zadania opieki."),
    care: step("Zadania opieki", "Dodawaj szczepienia, wizyty u weterynarza i inne terminy."),
    filters: step("Filtry", "Filtruj zadania po zwierzęciu lub statusie."),
    list: step("Lista opieki", "Wszystkie zaplanowane i zaległe zadania."),
  },
  chores: {
    header: step("Obowiązki domowe", "Rozdzielaj zadania w rodzinie i śledź wykonanie."),
    add: step("Nowy obowiązek", "Dodaj zadanie z terminem, osobą odpowiedzialną i powtarzalnością."),
    assign: step("Przypisanie", "Wybierz członka rodziny odpowiedzialnego za zadanie."),
    recurrence: step("Powtarzalność", "Ustaw cykl tygodniowy lub miesięczny — zadania odnawiają się same."),
    viewToggle: step("Lista i kalendarz", "Przełącz widok — lista albo kalendarz tygodnia."),
    filters: step("Filtry", "Pokaż aktywne, zaległe lub zakończone zadania."),
    list: step("Twoje zadania", "Odhaczaj wykonane obowiązki jednym kliknięciem."),
  },
  notes: {
    header: step("Notatki", "Wspólne notatki domowe — z kategoriami i widocznością dla rodziny."),
    add: step("Nowa notatka", "Dodaj notatkę z tytułem i treścią. Prefiks ! oznacza pilność."),
    pin: step("Przypinanie", "Przypięte notatki zostają na górze listy — ważne rzeczy pod ręką."),
    visibility: step("Widoczność rodzinna", "Ogranicz notatkę do wybranych członków rodziny lub udostępnij wszystkim."),
    category: step("Kategorie", "Grupuj notatki kolorowymi kategoriami."),
    filters: step("Filtry", "Szukaj po kategorii lub treści."),
    list: step("Lista notatek", "Wszystkie notatki w jednym miejscu — przypięte na górze."),
  },
  notifications: {
    header: step("Powiadomienia", "Tu zobaczysz aktywność w aplikacji i rodzinie — dodania, zmiany, przypomnienia."),
    filters: step("Filtry", "Przełączaj wszystkie, nieprzeczytane i przeczytane — łatwiej ogarnąć skrzynkę."),
    list: step("Lista powiadomień", "Kliknij wpis, by przejść do modułu lub oznaczyć jako przeczytane."),
  },
  settingsSolo: {
    accountType: step(
      "Typ konta",
      "Typ wybierasz przy rejestracji — tutaj tylko podgląd. Aby wejść do rodziny, użyj formularzy poniżej."
    ),
    joinFamily: step("Dołączenie do rodziny", "Wpisz kod zaproszenia od założyciela rodziny."),
    createFamily: step("Załóż rodzinę", "Możesz też utworzyć własną rodzinę — zostaniesz jej administratorem."),
    password: step("Hasło", "Zmień hasło regularnie — bezpieczeństwo konta zaczyna się tutaj."),
  },
};

const modulesEn: Record<string, Record<string, StepCopy>> = {
  budget: {
    header: step("Budget module", "Plan household finances — budgets, income, and expenses in one place."),
    add: step("New budget", "Create a budget for home, vacation, or recurring bills."),
    lists: step("Budget list", "Pick a budget on the left — the active one is highlighted."),
    hidden: step("Hidden budgets", "Budgets can be hidden from the list — toggle to show them again."),
    detail: step("Month details", "See income, expenses, and balance for the selected month."),
    income: step("Income", "Add income entries alongside expenses — balance updates automatically."),
    filters: step("Filters and entries", "Filter expenses and add new entries to the active budget."),
    export: step("Export and print", "Download CSV or print the monthly summary for your records."),
    watch: step("Watch budget", "Pin a budget to the dashboard for a quick snapshot."),
  },
  shopping: {
    header: step("Shopping lists", "Shared lists for the whole family — on phone or desktop."),
    add: step("New list", "Create a list for groceries, pharmacy, or DIY supplies."),
    lists: step("Your lists", "Select a list to view and edit its items."),
    items: step("List items", "Check off purchases, add quantities and categories."),
    categories: step("Family categories", "Items group into categories — the family founder configures them."),
    watch: step("Watch list", "Pin a list to the dashboard to track shopping progress."),
    addItem: step("Add item", "Quickly add another product to check off later."),
  },
  gifts: {
    header: step("Gifts", "Collect gift ideas for loved ones — nothing gets forgotten."),
    add: step("New idea", "Add an idea with recipient and notes before you forget."),
    filters: step("Filters", "Search by recipient or status during gift season."),
    list: step("Ideas list", "All ideas in one place — bought and planned."),
  },
  birthdays: {
    header: step("Birthdays", "Keep track of family and friends' birthdays."),
    add: step("Add birthday", "Save a person and date — Nimbusly will remind you in time."),
    calendar: step("Calendar", "Month view with birthdays marked."),
    list: step("Upcoming", "List of the nearest birthdays on the side."),
  },
  schedule: {
    header: step("Schedule", "Plan events, trips, and commitments on the calendar."),
    add: step("New event", "Add an entry with date, description, and optional date range."),
    multiday: step("Multi-day entries", "Set an end date — trips and multi-day events span the calendar."),
    calendar: step("Calendar", "Browse the month and click days for details."),
    list: step("Month list", "Chronological list of events in the current month."),
    print: step("Print schedule", "Print the month — handy for the fridge or family meetings."),
  },
  medicine: {
    header: step("Medicine cabinet", "Track medicines, expiry dates, and storage location."),
    add: step("Add medicine", "Record name, form, quantity, and expiry date."),
    filters: step("Filters", "Filter by availability or location."),
    list: step("Your medicines", "All cabinet items in a clear grid."),
  },
  watchlist: {
    header: step("Watchlist", "Movies and series — personal or shared with family."),
    add: step("Add title", "Add a show or film you want to watch."),
    platforms: step("Platforms", "Assign streaming services — easier to find where to watch."),
    status: step("Watched status", "Mark titles as watched or to-watch."),
    filters: step("Filters", "Filter by status or streaming platform."),
    list: step("Your list", "All titles with watched / to-watch status."),
  },
  restaurants: {
    header: step("Restaurants", "Save places to visit or recommend."),
    add: step("Add place", "Add name, address, and notes after your visit."),
    filters: step("Filters", "Search by venue type or visit status."),
    list: step("Your places", "List of saved restaurants and ratings."),
  },
  pets: {
    header: step("Pets", "Pet care — vaccines, vet visits, and daily tasks."),
    add: step("Add pet", "Register your pet to attach care tasks."),
    care: step("Care tasks", "Add vaccines, vet visits, and other due dates."),
    filters: step("Filters", "Filter tasks by pet or status."),
    list: step("Care list", "All planned and overdue care tasks."),
  },
  chores: {
    header: step("Chores", "Split household tasks and track completion."),
    add: step("New chore", "Add a task with due date, assignee, and recurrence."),
    assign: step("Assignment", "Pick the family member responsible for the task."),
    recurrence: step("Recurrence", "Set weekly or monthly cycles — tasks renew automatically."),
    viewToggle: step("List and calendar", "Switch between list and week calendar view."),
    filters: step("Filters", "Show active, overdue, or completed tasks."),
    list: step("Your tasks", "Check off completed chores with one click."),
  },
  notes: {
    header: step("Notes", "Shared household notes — with categories and family visibility."),
    add: step("New note", "Add a note with title and body. Prefix ! marks urgency."),
    pin: step("Pinning", "Pinned notes stay at the top — important items at hand."),
    visibility: step("Family visibility", "Limit a note to selected members or share with everyone."),
    category: step("Categories", "Group notes with colored categories."),
    filters: step("Filters", "Search by category or content."),
    list: step("Notes list", "All notes in one place — pinned at the top."),
  },
  notifications: {
    header: step("Notifications", "See app and family activity — additions, changes, and reminders."),
    filters: step("Filters", "Switch all, unread, and read — easier to manage your inbox."),
    list: step("Notification list", "Click an entry to open the module or mark as read."),
  },
  settingsSolo: {
    accountType: step(
      "Account type",
      "You choose your type at sign-up — this screen is read-only. To join a family, use the forms below."
    ),
    joinFamily: step("Join a family", "Enter an invite code from the family founder."),
    createFamily: step("Create a family", "You can also start your own family — you'll become its administrator."),
    password: step("Password", "Change your password regularly — account security starts here."),
  },
};

function withModuleSummaries(
  modules: Record<string, Record<string, StepCopy>>,
  summaries: Record<string, SummaryCopy>
) {
  return Object.fromEntries(
    Object.entries(modules).map(([id, steps]) => [id, { ...steps, summary: summaries[id] }])
  ) as Dict["nimbusTour"]["modules"];
}

type SummaryCopy = Dict["nimbusTour"]["modules"][string]["summary"];

export const nimbusTourMessagesPl: Dict["nimbusTour"] = {
  badge: "Przewodnik",
  summaryBadge: "Podsumowanie",
  summaryLearned: "Co poznałeś",
  summaryNext: "Co dalej",
  back: "Wstecz",
  next: "Dalej",
  finish: "Zakończ",
  closeAria: "Zamknij przewodnik",
  targetMissing: "Ten fragment nie jest teraz widoczny — możesz przejść dalej.",
  keyboardHint: "Strzałki ← → lub A / D — poprzedni i następny krok · Esc — przerwij i wznów później",
  intro: introPl,
  family: nimbusFamilyTourPl,
  modules: withModuleSummaries(modulesPl, nimbusModuleSummariesPl),
};

export const nimbusTourMessagesEn: Dict["nimbusTour"] = {
  badge: "Guide",
  summaryBadge: "Summary",
  summaryLearned: "What you learned",
  summaryNext: "What's next",
  back: "Back",
  next: "Next",
  finish: "Finish",
  closeAria: "Close guide",
  targetMissing: "This section isn't visible right now — you can continue.",
  keyboardHint: "Arrow keys ← → or A / D — previous and next step · Esc — pause and resume later",
  intro: introEn,
  family: nimbusFamilyTourEn,
  modules: withModuleSummaries(modulesEn, nimbusModuleSummariesEn),
};

export const nimbusCompanionExtraPl = {
  resumeTourAction: "Wznów przewodnik",
  resumeTourActionDesc: "Kontynuuj od ostatniego kroku",
  hintActionTour: "Pokaż tour",
  hintActionGo: "Przejdź",
  hintActionShow: "Pokaż",
  suppressSuggestion: "Nie pokazuj ponownie",
  suppressContextHint: "Nie przypominaj w tym module",
  onboardingIntroOffer: "Witaj w Nimbusly! Chcesz krótki przewodnik po aplikacji?",
  firstVisitTourOffer: "Pierwszy raz tutaj? Mogę pokazać Ci ten moduł krok po kroku.",
  attentionHint: "Masz {count} rzeczy w „Wymaga uwagi” — warto rzucić okiem.",
  attentionHintMany:
    "Masz {count} rzeczy w „Wymaga uwagi” — sporo tego! Kliknij „Pokaż”, a najważniejsze przypnij pinezką na górze listy.",
  changelogHintIntro: "Nowa wersja {version}! Co nowego:",
  changelogHintOutro: "Pełna lista zmian jest na stronie historii wersji.",
  searchFirstUseHint: "Wyszukiwarka Ctrl+K znajdzie moduły i dane w całej aplikacji.",
  moduleTourAction: "Pokaż mi ten moduł",
  moduleTourActionDesc: "Przewodnik po tej stronie",
  familyTourAction: "Konto rodzinne",
  familyTourActionDesc: "Zaproszenia, role, opuszczenie i sync",
  settingsSoloTourAction: "Konto solo",
  settingsSoloTourActionDesc: "Dołącz, załóż rodzinę i hasło",
  askNimbus: "Zapytaj Nimbusa",
  askNimbusDesc: "Pytania i szybkie odpowiedzi",
  faqSearchPlaceholder: "Szukaj w pytaniach…",
  faqGoTo: "Przejdź do modułu",
  faqEmpty: "Brak pytań pasujących do wyszukiwania.",
  faqModules: {
    settings: "Ustawienia",
    budget: "Budżet",
    shopping: "Zakupy",
    notes: "Notatki",
    chores: "Obowiązki",
    birthdays: "Urodziny",
    dashboard: "Dashboard",
    notifications: "Powiadomienia",
    search: "Wyszukiwarka",
  },
  snoozeTitle: "Przypomnij później",
  snoozeActionDesc: "Wybierz czas wyciszenia",
  snooze24h: "24 godziny",
  snooze24hDesc: "Bez podpowiedzi do jutra",
  snoozeWeek: "7 dni",
  snoozeWeekDesc: "Cisza przez cały tydzień",
  snoozeDone: "Podpowiedzi wyciszone — wrócę później.",
  backToMenu: "Wróć do menu",
  quietSettingLabel: "Tryb cichy Nimbusa",
  quietSettingDesc:
    "Bez losowych podpowiedzi, żartów i powitań — Nimbus reaguje tylko na menu i przewodniki.",
  sessionGreetings: [
    "Cześć, {name}! Miło Cię widzieć w Nimbusly.",
    "Witaj z powrotem, {name}! Chmura jest na posterunku.",
    "Hej, {name}! Gotowy na domowy porządek?",
    "Dzień dobry, {name}! Nimbus melduje się do służby.",
  ],
  jokes: [
    "Wiem, że jestem chmurą — ale listę zakupów i tak trzymam na tacy, nie w powietrzu.",
    "Mówią, że niebo nie ma limitu danych. Ja mam — za dużo obowiązków na raz.",
    "Gdyby budżet domowy miał skrzydła, leciałby… no właśnie — jestem chmurą, mogę pomóc go ogarnąć.",
    "Nie jestem pogodą — ale przewiduję burzę, gdy apteczka ma leki po terminie.",
    "Zero-jedynkowo: albo odhaczasz zakupy, albo ja znowu przypomnę za trzy minuty.",
    "Mój ulubiony moduł? Ten, w którym właśnie jesteś. (Tak, mówię to do każdego modułu.)",
    "Jestem chmurą, nie magią — hasła do WiFi nadal trzeba zapisać w notatkach.",
    "Domowe życie bez Nimbusly? Też działa. Ale kto wtedy pilnuje terminu na śmieci?",
  ],
  celebrations: {
    firstChore: "Pierwszy obowiązek za Tobą! Tak trzymaj.",
    firstShoppingList: "Pierwsza lista zakupów gotowa — miłych zakupów!",
    firstBudget: "Pierwszy budżet gotowy — finanse pod kontrolą!",
    firstBudgetEntry: "Pierwszy wpis w budżecie — świetny start!",
    firstUrgentNote: "Pilna notatka zapisana — trafi na dashboard.",
    firstBirthday: "Pierwsze urodziny w kalendarzu — przypomnę na czas!",
    firstPet: "Pupil dodany — opieka pod kontrolą.",
    firstScheduleEntry: "Pierwszy wpis w grafiku — plan nabiera kształtu!",
    firstGift: "Pierwszy pomysł na prezent — lista prezentów rusza!",
    firstWatchlistItem: "Pierwsza pozycja na watchliście — miłego oglądania!",
    firstFamilyInvite: "Pierwsze zaproszenie wysłane — rodzina rośnie!",
    firstNotification: "Pierwsze powiadomienie przeczytane — jesteś na bieżąco!",
  },
  context: {
    dashboard: "Na dashboardzie masz skróty do wszystkich modułów. Mogę Cię też przeprowadzić po aplikacji.",
    budget: "Tu dodajesz budżety i wpisy miesięczne. Chcesz krótki przewodnik po budżecie?",
    shopping: "Listy zakupów działają na żywo w rodzinie. Pokazać Ci jak z nich korzystać?",
    chores: "Obowiązki można przypisać do członków rodziny. Pomóc rozłożyć pierwsze zadania?",
    notes: "Notatka z ! na początku tytułu trafi do „Wymaga uwagi”. Chcesz zobaczyć jak to działa?",
    medicine: "W apteczce warto ustawić daty ważności — przypomnę zanim się przeterminują.",
    gifts: "Zbieraj pomysły na prezenty z odbiorcą — nic nie umknie przed świętami.",
    birthdays: "Daty urodzin pojawią się na dashboardzie — dodaj bliskich z wyprzedzeniem.",
    schedule: "Grafik łączy wydarzenia jedno- i wielodniowe — mogę pokazać jak dodawać wpisy.",
    watchlist: "Lista do obejrzenia działa solo lub w rodzinie — oznaczaj platformy i status.",
    restaurants: "Zapisuj miejsca do odwiedzenia — notatki po wizycie pomogą później.",
    pets: "Tu pilnujesz szczepień i wizyt u weterynarza — dodaj pupila i zadania opieki.",
    notifications: "Powiadomienia zbierają aktywność rodziny — filtruj nieprzeczytane.",
  },
  suggestions: {
    budgetNoMedicine: "Masz już budżet — może czas uzupełnić apteczkę o daty ważności leków?",
    shoppingNoChores: "Lista zakupów działa — rozważ obowiązki domowe, żeby dzielić zadania w rodzinie.",
    familyNoBirthdays: "Na koncie rodzinnym warto dodać urodziny bliskich — przypomnę na czas.",
    petsNoMedicine: "Masz zwierzaki — apteczka domowa też się przyda na podstawowe leki.",
    scheduleNoBirthdays:
      "Masz wpisy w grafiku — dodaj urodziny, żeby łatwiej planować wspólny czas z bliskimi.",
    giftsNoBirthdays: "Zbierasz pomysły na prezenty — urodziny bliskich ułatwią planowanie.",
    notesNoChores: "Notatki działają — obowiązki pomogą rozdzielić zadania z listy „do zrobienia”.",
    budgetNoEntries: "Budżet jest pusty — dodaj pierwszy wpis, żeby zobaczyć saldo miesiąca.",
    watchlistEmpty: "Watchlista czeka na pierwszy tytuł — serial albo film na wieczór?",
    medicineExpiring: "Coś w apteczce wygasa — sprawdź panel „Wymaga uwagi” na dashboardzie.",
    emptyDashboard: "Dashboard jest pusty — zacznij od budżetu, listy zakupów lub notatki.",
  },
  faq: {
    addFamilyMember: {
      q: "Jak dodać członka rodziny?",
      a: "Zarządzaj rodziną → wyślij zaproszenie mailem lub udostępnij kod zaproszenia.",
    },
    changeAvatar: {
      q: "Jak zmienić avatar?",
      a: "Profil i avatar → wybierz kolor i zapisz zmiany.",
    },
    addBudget: {
      q: "Jak założyć budżet?",
      a: "Wejdź w Budżet i kliknij przycisk dodawania nowego budżetu u góry strony.",
    },
    shoppingList: {
      q: "Jak stworzyć listę zakupów?",
      a: "W module Listy zakupów użyj przycisku nowej listy, potem dopisuj produkty.",
    },
    urgentNote: {
      q: "Jak oznaczyć pilną notatkę?",
      a: "Zacznij tytuł notatki od znaku ! — pojawi się w panelu „Wymaga uwagi”.",
    },
    hideNimbus: {
      q: "Jak ukryć Nimbusa?",
      a: "Profil i avatar → odznacz „Pokaż Nimbusa w aplikacji”.",
    },
    quietMode: {
      q: "Co to jest tryb cichy?",
      a: "W profilu włącz tryb cichy — Nimbus nie wysyła losowych podpowiedzi, żartów ani powitań, tylko reaguje na menu i przewodniki.",
    },
    familyRealtime: {
      q: "Jak działa współdzielenie w rodzinie?",
      a: "Na koncie rodzinnym listy, notatki i obowiązki synchronizują się na żywo między członkami.",
    },
    assignChore: {
      q: "Jak przypisać obowiązek?",
      a: "Przy tworzeniu lub edycji obowiązku wybierz osobę odpowiedzialną z listy członków rodziny.",
    },
    scheduleBirthdays: {
      q: "Grafik a urodziny — po co oba?",
      a: "Grafik to wydarzenia i wyjazdy, urodziny to stałe daty z przypomnieniami — razem łatwiej planować.",
    },
    nimbusTour: {
      q: "Jak uruchomić przewodnik?",
      a: "Kliknij Nimbusa → „Pokaż mi ten moduł” na stronie modułu lub „Przewodnik po aplikacji” z dowolnego miejsca.",
    },
    notifications: {
      q: "Skąd biorą się powiadomienia?",
      a: "Gdy ktoś w rodzinie doda lub zmieni dane — budżet, listę, obowiązek — pojawi się tu wpis z linkiem.",
    },
    globalSearch: {
      q: "Jak szukać w całej aplikacji?",
      a: "Użyj Ctrl+K (Cmd+K na Macu) lub przycisku wyszukiwania w nagłówku — znajdziesz moduły i wpisy.",
    },
    dashboardLayout: {
      q: "Jak dostosować dashboard?",
      a: "Na zakładce Podsumowanie włącz tryb edycji układu i wybierz karty modułów do wyświetlenia.",
    },
    attentionPin: {
      q: "Jak przypiąć pozycję w „Wymaga uwagi”?",
      a: "Na dashboardzie kliknij ikonę pinezki przy wpisie — trafi na samą górę listy. Kolejność zapisuje się razem z układem podsumowania.",
    },
    exportCsv: {
      q: "Jak wyeksportować dane do CSV?",
      a: "W budżecie i listach zakupów użyj przycisku eksportu CSV przy aktywnym elemencie.",
    },
    watchDashboard: {
      q: "Co to jest obserwowanie na dashboardzie?",
      a: "Przypinasz budżet lub listę zakupów — karta pojawia się na dashboardzie bez wchodzenia w moduł.",
    },
    shoppingCategories: {
      q: "Kto ustawia kategorie zakupów?",
      a: "Założyciel rodziny w ustawieniach → Kategorie zakupów. Produkty grupują się automatycznie.",
    },
    joinFamily: {
      q: "Jak dołączyć do rodziny?",
      a: "Na koncie solo: Typ konta → wpisz kod zaproszenia od założyciela rodziny.",
    },
    createFamily: {
      q: "Jak założyć własną rodzinę?",
      a: "Na koncie solo: Typ konta → Załóż rodzinę, podaj nazwę i zapisz. Zostaniesz administratorem.",
    },
    leaveFamily: {
      q: "Jak opuścić rodzinę?",
      a: "Zarządzaj rodziną → Opuść rodzinę. Założyciel musi najpierw przekazać rolę innemu członkowi.",
    },
    manageFamilyRoles: {
      q: "Jak zarządzać rolami i członkami?",
      a: "W Zarządzaj rodziną administrator nadaje role, usuwa członków, a założyciel może przekazać swoją rolę.",
    },
    accountTypeSetup: {
      q: "Czy mogę zmienić typ konta po rejestracji?",
      a: "Typ (solo / rodzinne) wybierasz przy zakładaniu konta. Później dołączasz do rodziny, zakładasz własną lub opuszczasz grupę — bez przełącznika typu.",
    },
  },
};

export const nimbusCompanionExtraEn = {
  resumeTourAction: "Resume tour",
  resumeTourActionDesc: "Continue from the last step",
  hintActionTour: "Show tour",
  hintActionGo: "Go",
  hintActionShow: "Show",
  suppressSuggestion: "Don't show again",
  suppressContextHint: "Don't remind in this module",
  onboardingIntroOffer: "Welcome to Nimbusly! Want a quick app tour?",
  firstVisitTourOffer: "First time here? I can walk you through this module step by step.",
  attentionHint: "You have {count} items in Needs attention — worth a look.",
  attentionHintMany:
    "You have {count} items in Needs attention — quite a list! Tap Show, then pin the most important ones to the top.",
  changelogHintIntro: "New version {version}! What's new:",
  changelogHintOutro: "See the full changelog for all details.",
  searchFirstUseHint: "Press Ctrl+K to search modules and data across the app.",
  moduleTourAction: "Show me this module",
  moduleTourActionDesc: "Tour of this page",
  familyTourAction: "Family account",
  familyTourActionDesc: "Invites, roles, leaving, and sync",
  settingsSoloTourAction: "Solo account",
  settingsSoloTourActionDesc: "Join, create a family, and password",
  askNimbus: "Ask Nimbus",
  askNimbusDesc: "Questions and quick answers",
  faqSearchPlaceholder: "Search questions…",
  faqGoTo: "Go to module",
  faqEmpty: "No questions match your search.",
  faqModules: {
    settings: "Settings",
    budget: "Budget",
    shopping: "Shopping",
    notes: "Notes",
    chores: "Chores",
    birthdays: "Birthdays",
    dashboard: "Dashboard",
    notifications: "Notifications",
    search: "Search",
  },
  snoozeTitle: "Remind me later",
  snoozeActionDesc: "Pick how long to snooze",
  snooze24h: "24 hours",
  snooze24hDesc: "No hints until tomorrow",
  snoozeWeek: "7 days",
  snoozeWeekDesc: "Quiet for the whole week",
  snoozeDone: "Hints snoozed — I'll be back later.",
  backToMenu: "Back to menu",
  quietSettingLabel: "Nimbus quiet mode",
  quietSettingDesc:
    "No random hints, jokes, or greetings — Nimbus only responds to menu and tours.",
  sessionGreetings: [
    "Hi, {name}! Good to see you in Nimbusly.",
    "Welcome back, {name}! Your cloud is on duty.",
    "Hey, {name}! Ready to keep the home in order?",
    "Good day, {name}! Nimbus reporting for service.",
  ],
  jokes: [
    "Yes, I'm a cloud — but I keep your shopping list on a tray, not floating in the sky.",
    "They say the sky has unlimited storage. I disagree — too many chores at once.",
    "If a household budget had wings, it would fly… well, I'm a cloud, I can help you track it.",
    "I'm not the weather — but I sense a storm when the medicine cabinet has expired items.",
    "Binary choice: check off groceries, or I'll remind you again in three minutes.",
    "Favorite module? The one you're in right now. (Yes, I say that to every module.)",
    "I'm a cloud, not magic — WiFi passwords still belong in notes.",
    "Home life without Nimbusly? Sure. But who watches the trash day deadline?",
  ],
  celebrations: {
    firstChore: "First chore done! Nice work.",
    firstShoppingList: "Your first shopping list is ready — happy shopping!",
    firstBudget: "First budget created — finances under control!",
    firstBudgetEntry: "First budget entry logged — great start!",
    firstUrgentNote: "Urgent note saved — it'll show on the dashboard.",
    firstBirthday: "First birthday in the calendar — I'll remind you in time!",
    firstPet: "Pet added — care tasks are ready to go.",
    firstScheduleEntry: "First schedule entry — your plan is taking shape!",
    firstGift: "First gift idea saved — your gift list is rolling!",
    firstWatchlistItem: "First watchlist item — happy watching!",
    firstFamilyInvite: "First invite sent — your family is growing!",
    firstNotification: "First notification read — you're all caught up!",
  },
  context: {
    dashboard: "The dashboard shortcuts lead to every module. I can also walk you through the app.",
    budget: "Add budgets and monthly entries here. Want a quick budget tour?",
    shopping: "Shopping lists sync live for family. Want me to show you how they work?",
    chores: "Chores can be assigned to family members. Need help setting up the first tasks?",
    notes: "A note title starting with ! appears in Needs attention. Want to see how?",
    medicine: "Set expiry dates in the cabinet — I'll remind you before they lapse.",
    gifts: "Collect gift ideas with recipients — nothing slips away before the holidays.",
    birthdays: "Birthdays surface on the dashboard — add loved ones ahead of time.",
    schedule: "Schedule combines single- and multi-day events — I can show you how to add entries.",
    watchlist: "Watchlist works solo or with family — tag platforms and watched status.",
    restaurants: "Save places to visit — post-visit notes help later.",
    pets: "Track vaccines and vet visits here — add your pet and care tasks.",
    notifications: "Notifications collect family activity — filter unread items.",
  },
  suggestions: {
    budgetNoMedicine: "You have a budget — consider filling the medicine cabinet with expiry dates too.",
    shoppingNoChores: "Shopping lists are rolling — try chores to split household tasks in the family.",
    familyNoBirthdays: "On a family account, add birthdays so I can remind you in time.",
    petsNoMedicine: "You have pets — a home medicine cabinet helps for basics too.",
    scheduleNoBirthdays:
      "You have schedule entries — add birthdays to plan shared time with loved ones.",
    giftsNoBirthdays: "You're collecting gift ideas — birthdays make seasonal planning easier.",
    notesNoChores: "Notes are working — chores help turn to-dos into assigned tasks.",
    budgetNoEntries: "Your budget is empty — add a first entry to see the monthly balance.",
    watchlistEmpty: "Watchlist is waiting for a first title — a show or movie for tonight?",
    medicineExpiring: "Something in the cabinet is expiring — check Needs attention on the dashboard.",
    emptyDashboard: "Dashboard is empty — start with a budget, shopping list, or note.",
  },
  faq: {
    addFamilyMember: {
      q: "How do I add a family member?",
      a: "Manage family → send an email invite or share your invite code.",
    },
    changeAvatar: {
      q: "How do I change my avatar?",
      a: "Profile and avatar → pick a color and save.",
    },
    addBudget: {
      q: "How do I create a budget?",
      a: "Open Budget and use the add-budget button at the top.",
    },
    shoppingList: {
      q: "How do I create a shopping list?",
      a: "In Shopping lists, create a new list, then add products.",
    },
    urgentNote: {
      q: "How do I mark an urgent note?",
      a: "Start the note title with ! — it will show in Needs attention.",
    },
    hideNimbus: {
      q: "How do I hide Nimbus?",
      a: "Profile and avatar → uncheck Show Nimbus in the app.",
    },
    quietMode: {
      q: "What is quiet mode?",
      a: "Enable quiet mode in profile — Nimbus won't send random hints, jokes, or greetings, only menu and tours.",
    },
    familyRealtime: {
      q: "How does family sharing work?",
      a: "On a family account, lists, notes, and chores sync live between members.",
    },
    assignChore: {
      q: "How do I assign a chore?",
      a: "When creating or editing a chore, pick the responsible person from family members.",
    },
    scheduleBirthdays: {
      q: "Schedule and birthdays — why both?",
      a: "Schedule is for events and trips; birthdays are fixed dates with reminders — together they plan better.",
    },
    nimbusTour: {
      q: "How do I start a tour?",
      a: "Click Nimbus → Show me this module on a module page, or App tour from anywhere.",
    },
    notifications: {
      q: "Where do notifications come from?",
      a: "When someone in the family adds or changes data — budget, list, chore — an entry appears here with a link.",
    },
    globalSearch: {
      q: "How do I search the whole app?",
      a: "Use Ctrl+K (Cmd+K on Mac) or the search button in the header — find modules and entries.",
    },
    dashboardLayout: {
      q: "How do I customize the dashboard?",
      a: "On the Summary tab, enable layout edit mode and pick which module cards to show.",
    },
    attentionPin: {
      q: "How do I pin a Needs attention item?",
      a: "On the dashboard, click the pin icon next to an item — it moves to the top of the list. Pin order is saved with your overview layout.",
    },
    exportCsv: {
      q: "How do I export data to CSV?",
      a: "In Budget and Shopping lists, use the CSV export button on the active item.",
    },
    watchDashboard: {
      q: "What is watching on the dashboard?",
      a: "Pin a budget or shopping list — its card appears on the dashboard without opening the module.",
    },
    shoppingCategories: {
      q: "Who sets shopping categories?",
      a: "The family founder in Settings → Shopping categories. Products group automatically.",
    },
    joinFamily: {
      q: "How do I join a family?",
      a: "On a solo account: Account type → enter the invite code from the family founder.",
    },
    createFamily: {
      q: "How do I create my own family?",
      a: "On a solo account: Account type → Create family, enter a name, and save. You become the administrator.",
    },
    leaveFamily: {
      q: "How do I leave a family?",
      a: "Manage family → Leave family. The founder must transfer founder role to another member first.",
    },
    manageFamilyRoles: {
      q: "How do I manage roles and members?",
      a: "In Manage family, admins assign roles and remove members; the founder can transfer founder ownership.",
    },
    accountTypeSetup: {
      q: "Can I change account type after sign-up?",
      a: "You choose solo or family at sign-up. Later you join, create, or leave a family — there is no account-type toggle.",
    },
  },
};
