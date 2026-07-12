import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

const modulePages = [
  { path: "/budget", title: t.modules.budget },
  { path: "/shopping", title: t.modules.shopping },
  { path: "/gifts", title: t.modules.gifts },
  { path: "/birthdays", title: t.modules.birthdays },
  { path: "/schedule", title: t.modules.schedule },
  { path: "/calendar", title: t.modules.familyCalendar },
  { path: "/family", title: t.modules.family },
  { path: "/medicine-cabinet", title: t.modules.medicineCabinet },
  { path: "/watchlist", title: t.modules.watchlist },
  { path: "/restaurants", title: t.modules.restaurants },
  { path: "/pets", title: t.modules.pets },
  { path: "/chores", title: t.modules.chores },
  { path: "/notes", title: t.modules.notes },
  { path: "/notifications", title: t.notifications.title },
] as const;

describe("Moduły - smoke", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "modules-smoke",
      firstName: "Smoke",
      lastName: "Tester",
      familyName: "Rodzina Smoke",
    }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  beforeEach(() => {
    cy.login(testUser.email, testUser.password);
  });

  modulePages.forEach(({ path, title }) => {
    it(`ładuje ${path}`, () => {
      cy.visit(path);
      cy.contains("h1", title).should("be.visible");
    });
  });
});
