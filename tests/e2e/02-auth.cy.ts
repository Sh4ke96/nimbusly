import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Rejestracja", () => {
  it("pokazuje formularz rejestracji", () => {
    cy.visit("/register");
    cy.contains("h1", t.register.title).should("be.visible");
    cy.contains("p", t.register.subtitle).should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirmPassword").should("be.visible");
  });

  it("waliduje niezgodne hasła", () => {
    cy.visit("/register");
    cy.get("#email").type("rejestracja@nimbusly.test");
    cy.get("#password").type("haslo1234");
    cy.get("#confirmPassword").type("innehaslo");
    cy.contains("button", t.register.submit).click();
    cy.contains(t.register.errorPasswordMatch).should("be.visible");
  });

  it("waliduje zbyt krótkie hasło", () => {
    cy.visit("/register");
    cy.get("#email").type("krotkie@nimbusly.test");
    cy.get("#password").type("123");
    cy.get("#confirmPassword").type("123");
    cy.contains("button", t.register.submit).click();
    cy.contains(t.register.errorPasswordLength).should("be.visible");
  });

  it("rejestruje nowego użytkownika przez UI", () => {
    const email = `register-ui-${Date.now()}@example.com`;
    const password = "TestPassword123!";

    cy.visit("/register");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.get("#confirmPassword").type(password);
    cy.contains("button", t.register.submit).click();

    cy.contains(t.register.successTitle, { timeout: 20_000 }).should("be.visible");
  });
});

describe("Logowanie", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.createTestUser({ prefix: "login" }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("pokazuje formularz logowania", () => {
    cy.visit("/login");
    cy.contains("h1", t.login.title).should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
  });

  it("pokazuje błąd przy nieprawidłowych danych", () => {
    cy.visit("/login");
    cy.get("#email").type("nieistniejacy@nimbusly.test");
    cy.get("#password").type("ZleHaslo123!");
    cy.contains("button", t.login.submit).click();
    cy.contains(t.login.errorInvalid).should("be.visible");
  });

  it("loguje użytkownika bez onboardingu i przekierowuje na /onboarding", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/onboarding");
    cy.url().should("include", "/onboarding");
    cy.contains("h1", t.onboarding.title).should("be.visible");
  });

  it("przekierowuje zalogowanego użytkownika z /login", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/login");
    cy.url().should("not.include", "/login");
    cy.url().should("match", /\/(onboarding|dashboard)/);
  });
});

describe("Logowanie — użytkownik po onboardingu", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "login-done",
      firstName: "Ewa",
      lastName: "Zalogowana",
      familyName: "Rodzina Ewy",
    }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("przekierowuje na dashboard po zalogowaniu", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
    cy.contains("h1", `${t.dashboard.greeting}, Ewa`).should("be.visible");
  });
});
