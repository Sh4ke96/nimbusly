import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Watchlist module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "watchlist",
      firstName: "Wiktor",
      lastName: "Watchlist",
      familyName: "Rodzina Watchlist",
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
    cy.visit("/watchlist");
  });

  it("pokazuje nagłówek modułu watchlisty", () => {
    cy.contains("h1", t.watchlist.title).should("be.visible");
    cy.contains("p", t.watchlist.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania pozycji", () => {
    cy.contains("button", t.watchlist.addBtn).click();
    cy.contains('[role="dialog"]', t.watchlist.addTitle).should("be.visible");
  });
});
