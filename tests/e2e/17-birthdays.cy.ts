import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Birthdays module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "birthdays",
      firstName: "Basia",
      lastName: "Urodziny",
      familyName: "Rodzina Urodziny",
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
    cy.visit("/birthdays");
  });

  it("pokazuje nagłówek modułu urodzin", () => {
    cy.contains("h1", t.birthdays.title).should("be.visible");
    cy.contains("p", t.birthdays.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania urodzin", () => {
    cy.contains("button", t.birthdays.addBtn).click();
    cy.contains('[role="dialog"]', t.birthdays.addTitle).should("be.visible");
  });
});
