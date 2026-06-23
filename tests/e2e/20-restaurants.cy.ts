import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Restaurants module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "restaurants",
      firstName: "Rafał",
      lastName: "Restauracje",
      familyName: "Rodzina Restauracje",
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
    cy.visit("/restaurants");
  });

  it("pokazuje nagłówek modułu restauracji", () => {
    cy.contains("h1", t.restaurants.title).should("be.visible");
    cy.contains("p", t.restaurants.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania miejsca", () => {
    cy.contains("button", t.restaurants.addBtn).click();
    cy.contains('[role="dialog"]', t.restaurants.addTitle).should("be.visible");
  });
});
