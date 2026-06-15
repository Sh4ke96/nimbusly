import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Pets module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "pets",
      firstName: "Piotr",
      lastName: "Zwierz",
      familyName: "Rodzina Zwierz",
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
    cy.visit("/pets");
  });

  it("pokazuje nagłówek modułu zwierząt", () => {
    cy.contains("h1", t.pets.title).should("be.visible");
    cy.contains("p", t.pets.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania zwierzęcia", () => {
    cy.contains("button", t.pets.addBtn).click();
    cy.contains('[role="dialog"]', t.pets.addTitle).should("be.visible");
  });
});
