import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Notifications module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "notifications",
      firstName: "Nina",
      lastName: "Powiadomienia",
      familyName: "Rodzina Powiadomienia",
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
    cy.visit("/notifications");
  });

  it("pokazuje nagłówek modułu powiadomień", () => {
    cy.contains("h1", t.notifications.title).should("be.visible");
    cy.contains("p", t.notifications.subtitle).should("be.visible");
  });
});
