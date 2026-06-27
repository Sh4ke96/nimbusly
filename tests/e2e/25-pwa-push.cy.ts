import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("PWA push prompt", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedSoloUser({
      prefix: "pwa-push",
      firstName: "Pwa",
      lastName: "Push",
    }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("pokazuje ustawienie push w profilu (dev: tylko opis)", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/profile/settings?tab=profile");
    cy.contains(t.pwa.pushSettingLabel).should("be.visible");
  });
});
