import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Chores module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "chores",
      firstName: "Ola",
      lastName: "Obowiazek",
      familyName: "Rodzina Obowiazek",
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
    cy.visit("/chores");
  });

  it("pokazuje nagłówek modułu obowiązków", () => {
    cy.contains("h1", t.chores.title).should("be.visible");
    cy.contains("p", t.chores.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania zadania", () => {
    cy.contains("button", t.chores.addBtn).click();
    cy.contains('[role="dialog"]', t.chores.addTitle).should("be.visible");
  });
});
