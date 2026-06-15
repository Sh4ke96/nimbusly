import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Notes module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "notes",
      firstName: "Nora",
      lastName: "Notatka",
      familyName: "Rodzina Notatka",
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
    cy.visit("/notes");
  });

  it("pokazuje nagłówek modułu notatek", () => {
    cy.contains("h1", t.notes.title).should("be.visible");
    cy.contains("p", t.notes.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania notatki", () => {
    cy.contains("button", t.notes.addBtn).click();
    cy.contains('[role="dialog"]', t.notes.addTitle).should("be.visible");
  });
});
