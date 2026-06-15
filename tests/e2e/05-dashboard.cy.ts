import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Dashboard", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "dashboard",
      firstName: "Ola",
      lastName: "Panel",
      familyName: "Rodzina Panel",
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
    cy.visit("/dashboard");
  });

  it("pokazuje powitanie z imieniem", () => {
    cy.contains("h1", `${t.dashboard.greeting}, Ola`).should("be.visible");
  });

  it("pokazuje wszystkie moduły", () => {
    cy.contains('[role="tab"]', t.dashboard.modules).click();
    t.dashboard.moduleLabels.forEach((label) => {
      cy.contains("p", label).should("be.visible");
    });
  });

  it("otwiera menu konta z linkami do ustawień", () => {
    cy.openAccountMenu();
    cy.contains(t.account.menuProfile).should("be.visible");
    cy.contains(t.account.menuAccountType).should("be.visible");
    cy.contains(t.account.menuFamily).should("be.visible");
    cy.contains(t.account.menuPassword).should("be.visible");
    cy.contains(t.dashboard.logout).should("be.visible");
  });

  it("przechodzi do ustawień profilu z menu konta", () => {
    cy.openAccountMenu();
    cy.contains(t.account.menuProfile).click();
    cy.url().should("include", "/profile/settings");
    cy.url().should("include", "tab=profile");
    cy.contains("h1", t.account.settingsTitle).should("be.visible");
  });
});
