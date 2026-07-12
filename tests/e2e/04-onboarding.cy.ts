import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Onboarding - ścieżka rodzinna", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.createTestUser({ prefix: "onboard-family" }).then((user) => {
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
    cy.visit("/onboarding");
  });

  it("przechodzi przez wszystkie kroki i tworzy konto rodzinne", () => {
    cy.completeOnboardingFamily({
      firstName: "Kasia",
      lastName: "Rodzinna",
      familyName: "Rodzina Testowa",
      colorId: "pine",
    });
  });

  it("umożliwia cofanie się między krokami", () => {
    cy.contains("h2", t.onboarding.colorTitle).should("be.visible");
    cy.contains("button", t.onboarding.next).click();

    cy.get("#firstName").type("Test");
    cy.get("#lastName").type("User");
    cy.contains("button", t.onboarding.next).click();

    cy.contains("button", t.onboarding.back).click();
    cy.contains("h2", t.onboarding.nameTitle).should("be.visible");
    cy.get("#firstName").should("have.value", "Test");
  });
});

describe("Onboarding - ścieżka solo", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.createTestUser({ prefix: "onboard-solo" }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("kończy onboarding na koncie solo", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/onboarding");
    cy.completeOnboardingSolo({
      firstName: "Piotr",
      lastName: "Solo",
      colorId: "slate",
    });
  });
});

describe("Onboarding - wylogowanie", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.createTestUser({ prefix: "onboard-logout" }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("wylogowuje z nagłówka onboardingu", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/onboarding");
    cy.contains("button", t.dashboard.logout).click();
    cy.contains(t.dashboard.logoutConfirmTitle).should("be.visible");
    cy.get('[data-testid="logout-confirm-submit"]').click();
    cy.url().should("include", "/login");
  });
});
