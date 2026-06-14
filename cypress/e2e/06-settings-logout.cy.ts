import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Ustawienia konta", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "settings",
      firstName: "Zosia",
      lastName: "Ustawienia",
      familyName: "Rodzina Ustawień",
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
    cy.visit("/profile/settings");
    cy.contains("h1", t.account.settingsTitle).should("be.visible");
  });

  it("pokazuje breadcrumb z linkiem do panelu", () => {
    cy.get('[aria-label="breadcrumb"]').within(() => {
      cy.contains("a", t.account.breadcrumbDashboard).should("have.attr", "href", "/dashboard");
    });
  });

  it("wyświetla wszystkie zakładki w sidebarze", () => {
    cy.get('[data-slot="tabs-trigger"]').as("tabs");
    cy.get("@tabs").contains(t.account.menuProfile).should("be.visible");
    cy.get("@tabs").contains(t.account.menuAccountType).should("be.visible");
    cy.get("@tabs").contains(t.account.menuFamily).should("be.visible");
    cy.get("@tabs").contains(t.account.menuPassword).should("be.visible");
  });

  it("przełącza zakładki przez sidebar", () => {
    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuAccountType).click();
    cy.url().should("include", "tab=account");

    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuFamily).click();
    cy.url().should("include", "tab=family");

    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuPassword).click();
    cy.url().should("include", "tab=password");
  });

  it("aktualizuje profil (imię i nazwisko)", () => {
    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuProfile).click();
    cy.get("#settings-firstName").clear().type("Zofia");
    cy.get("#settings-lastName").clear().type("Zmieniona");
    cy.contains("button", t.account.save).click();
    cy.expectToast(t.account.profileSaved);
  });

  it("pokazuje formularz typu konta", () => {
    cy.visit("/profile/settings?tab=account");
    cy.contains("button", t.onboarding.familyTitle).should("be.visible");
    cy.contains("button", t.onboarding.soloTitle).should("be.visible");
  });

  it("pokazuje sekcję rodziny z nazwą", () => {
    cy.visit("/profile/settings?tab=family");
    cy.get("#settings-family-name").should("have.value", "Rodzina Ustawień");
  });

  it("wysyła prośbę o reset hasła", () => {
    cy.visit("/profile/settings?tab=password");
    cy.contains("button", t.account.changePasswordBtn).click();
    cy.contains(t.account.changePasswordSuccessMessage, { timeout: 15_000 }).should(
      "be.visible"
    );
  });
});

describe("Ustawienia — konto solo", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedSoloUser({
      prefix: "settings-solo",
      firstName: "Adam",
      lastName: "Solo",
    }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("nie pokazuje zakładki rodziny dla konta solo", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/profile/settings");
    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuProfile).should("be.visible");
    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuFamily).should("not.exist");
  });
});

describe("Wylogowanie", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedSoloUser({
      prefix: "logout",
      firstName: "Logout",
      lastName: "Test",
    }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("wylogowuje z menu konta i blokuje panel", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/dashboard");
    cy.openAccountMenu();
    cy.contains(t.dashboard.logout).click();
    cy.url().should("include", "/login");

    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });
});
