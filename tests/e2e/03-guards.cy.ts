describe("Strażniki tras (auth)", () => {
  it("przekierowuje niezalogowanego użytkownika z panelu na logowanie", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });

  it("przekierowuje niezalogowanego użytkownika z ustawień na logowanie", () => {
    cy.visit("/profile/settings");
    cy.url().should("include", "/login");
  });

  it("przekierowuje niezalogowanego użytkownika z onboardingu na logowanie", () => {
    cy.visit("/onboarding");
    cy.url().should("include", "/login");
  });
});

import type { CreatedTestUser } from "../support/commands";

describe("Strażniki tras — onboarding", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.createTestUser({ prefix: "guard-pending" }).then((user) => {
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
  });

  it("blokuje dashboard przed ukończeniem onboardingu", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/onboarding");
  });

  it("blokuje ustawienia przed ukończeniem onboardingu", () => {
    cy.visit("/profile/settings");
    cy.url().should("include", "/onboarding");
  });
});

describe("Strażniki tras — po onboardingu", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedSoloUser({
      prefix: "guard-done",
      firstName: "Marek",
      lastName: "Gotowy",
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
  });

  it("blokuje ponowne wejście na onboarding", () => {
    cy.visit("/onboarding");
    cy.url().should("include", "/dashboard");
  });

  it("przekierowuje /change-password do ustawień hasła", () => {
    cy.visit("/change-password");
    cy.url().should("include", "/profile/settings");
    cy.url().should("include", "tab=password");
  });
});
