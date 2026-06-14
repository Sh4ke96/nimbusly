import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Gifts module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "gifts",
      firstName: "Ania",
      lastName: "Prezent",
      familyName: "Rodzina Prezent",
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
    cy.visit("/gifts");
  });

  it("pokazuje nagłówek modułu prezentów", () => {
    cy.contains("h1", t.gifts.title).should("be.visible");
    cy.contains("p", t.gifts.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania pomysłu", () => {
    cy.contains("button", t.gifts.addBtn).click();
    cy.contains('[role="dialog"]', t.gifts.addTitle).should("be.visible");
  });
});
