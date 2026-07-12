import type { CreatedTestUser } from "../support/commands";
import { SETTINGS_TAB } from "../support/app-constants";
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

  it("nie pokazuje zakładki rodziny w ustawieniach", () => {
    cy.get('[data-slot="tabs-trigger"]').as("tabs");
    cy.get("@tabs").contains(t.account.menuProfile).should("be.visible");
    cy.get("@tabs").contains(t.account.menuAccountType).should("be.visible");
    cy.get("@tabs").contains(t.account.menuFamily).should("not.exist");
    cy.get("@tabs").contains(t.account.menuPassword).should("be.visible");
    cy.get("@tabs").contains(t.account.menuPermissions).should("not.exist");
  });

  it("przełącza zakładki przez sidebar", () => {
    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuAccountType).click();
    cy.url().should("include", `tab=${SETTINGS_TAB.ACCOUNT}`);

    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuPassword).click();
    cy.url().should("include", `tab=${SETTINGS_TAB.PASSWORD}`);
  });

  it("aktualizuje profil (imię i nazwisko)", () => {
    cy.get('[data-slot="tabs-trigger"]').contains(t.account.menuProfile).click();
    cy.get("#settings-firstName").clear().type("Zofia");
    cy.get("#settings-lastName").clear().type("Zmieniona");
    cy.contains("button", t.account.save).click();
    cy.expectToast(t.account.profileSaved);
  });

  it("pokazuje typ konta (tylko podgląd)", () => {
    cy.visit(`/profile/settings?tab=${SETTINGS_TAB.ACCOUNT}`);
    cy.contains(t.onboarding.familyTitle).should("be.visible");
    cy.contains(t.onboarding.soloTitle).should("be.visible");
    cy.contains(t.account.accountTypeFixedDesc).should("be.visible");
  });

  it("pokazuje scaloną sekcję rodziny z członkami i uprawnieniami", () => {
    cy.visit("/family");
    cy.contains("h1", t.family.pageTitle).should("be.visible");
    cy.get("#settings-family-name").should("have.value", "Rodzina Ustawień");
    cy.contains("h3", t.account.permissionsMembersTitle).should("be.visible");
    cy.contains("button", t.account.leaveFamilyBtn).should("be.visible");
  });

  it("przekierowuje legacy zakładki settings na /family", () => {
    cy.visit(`/profile/settings?tab=${SETTINGS_TAB.PERMISSIONS}`);
    cy.url().should("include", "/family");
    cy.contains("h3", t.account.permissionsMembersTitle).should("be.visible");
  });

  it("wysyła prośbę o reset hasła", () => {
    cy.visit(`/profile/settings?tab=${SETTINGS_TAB.PASSWORD}`);
    cy.contains("button", t.account.changePasswordBtn).click();
    cy.contains(t.account.changePasswordSuccessMessage, { timeout: 15_000 }).should(
      "be.visible"
    );
  });
});

describe("Ustawienia - konto solo", () => {
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
    cy.contains(t.dashboard.logoutConfirmTitle).should("be.visible");
    cy.get('[data-testid="logout-confirm-submit"]').click();
    cy.url().should("include", "/login");

    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });
});
