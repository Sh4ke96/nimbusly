import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Budget module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "budget",
      firstName: "Bogdan",
      lastName: "Budżet",
      familyName: "Rodzina Budżet",
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
    cy.visit("/budget");
  });

  it("pokazuje nagłówek modułu budżetu", () => {
    cy.contains("h1", t.budget.title).should("be.visible");
    cy.contains("p", t.budget.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania budżetu", () => {
    cy.contains("button", t.budget.addBtn).click();
    cy.contains('[role="dialog"]', t.budget.addTitle).should("be.visible");
  });
});
