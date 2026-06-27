import type { TestUserSeed } from "../tasks/supabase";
import { t } from "./texts";

export type CreatedTestUser = {
  email: string;
  password: string;
  userId: string;
};

export type { TestUserSeed } from "../tasks/supabase";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      createTestUser(options?: {
        prefix?: string;
        password?: string;
        seed?: TestUserSeed;
      }): Chainable<CreatedTestUser>;

      deleteTestUser(userId: string): Chainable<null>;

      login(email: string, password: string): Chainable<void>;

      openAccountMenu(): Chainable<void>;

      expectToast(text: string): Chainable<void>;

      completeOnboardingFamily(options?: {
        firstName?: string;
        lastName?: string;
        familyName?: string;
        colorId?: string;
      }): Chainable<void>;

      completeOnboardingSolo(options?: {
        firstName?: string;
        lastName?: string;
        colorId?: string;
      }): Chainable<void>;

      completeOnboardingJoin(options?: {
        firstName?: string;
        lastName?: string;
        inviteCode?: string;
        colorId?: string;
      }): Chainable<void>;

      getFamilyInviteCode(userId: string): Chainable<string>;

      setupOnboardedFamilyUser(options?: {
        prefix?: string;
        firstName?: string;
        lastName?: string;
        familyName?: string;
        colorId?: string;
      }): Chainable<CreatedTestUser>;

      setupOnboardedSoloUser(options?: {
        prefix?: string;
        firstName?: string;
        lastName?: string;
        colorId?: string;
      }): Chainable<CreatedTestUser>;
    }
  }
}

Cypress.Commands.add(
  "createTestUser",
  (options: {
    prefix?: string;
    password?: string;
    seed?: TestUserSeed;
  } = {}) => {
    return cy.task<CreatedTestUser>("createTestUser", options);
  }
);

Cypress.Commands.add("deleteTestUser", (userId: string) => {
  return cy.task("deleteTestUser", { userId });
});

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session(
    ["login", email],
    () => {
      cy.visit("/login");
      cy.get("#email").clear().type(email);
      cy.get("#password").clear().type(password, { log: false });
      cy.contains("button", t.login.submit).click();
      cy.url().should("not.include", "/login");
    },
    { cacheAcrossSpecs: true }
  );
});

Cypress.Commands.add("openAccountMenu", () => {
  cy.get('[data-testid="account-menu-trigger"]').click();
});

Cypress.Commands.add("expectToast", (text: string) => {
  cy.get("[data-sonner-toast]", { timeout: 15_000 }).should("contain.text", text);
});

Cypress.Commands.add(
  "completeOnboardingFamily",
  ({
    firstName = "Anna",
    lastName = "Kowalska",
    familyName = "Rodzina Kowalskich",
    colorId = "forest",
  } = {}) => {
    cy.url().should("include", "/onboarding");
    cy.contains("h1", t.onboarding.title).should("be.visible");

    cy.contains("h2", t.onboarding.colorTitle).should("be.visible");
    cy.get(`button[aria-label="${colorId}"]`).click();
    cy.contains("button", t.onboarding.next).click();

    cy.contains("h2", t.onboarding.nameTitle).should("be.visible");
    cy.get("#firstName").clear().type(firstName);
    cy.get("#lastName").clear().type(lastName);
    cy.contains("button", t.onboarding.next).click();

    cy.contains("h2", t.onboarding.accountTitle).should("be.visible");
    cy.contains("button", t.onboarding.familyTitle).click();
    cy.get("#familyName").clear().type(familyName);
    cy.contains("button", t.onboarding.finish).click();

    cy.url().should("include", "/dashboard");
    cy.contains("h1", `${t.dashboard.greeting}, ${firstName}`).should("be.visible");
  }
);

Cypress.Commands.add(
  "completeOnboardingJoin",
  ({
    firstName = "Tomek",
    lastName = "Dołączony",
    inviteCode = "",
    colorId = "pine",
  } = {}) => {
    cy.url().should("include", "/onboarding");
    cy.contains("h2", t.onboarding.colorTitle).should("be.visible");
    cy.get(`button[aria-label="${colorId}"]`).click();
    cy.contains("button", t.onboarding.next).click();

    cy.get("#firstName").clear().type(firstName);
    cy.get("#lastName").clear().type(lastName);
    cy.contains("button", t.onboarding.next).click();

    cy.contains("button", t.onboarding.joinFamilyTitle).click();
    if (inviteCode) {
      cy.get("#inviteCode").clear().type(inviteCode);
    }
    cy.contains("button", t.onboarding.finish).click();

    cy.url().should("include", "/dashboard");
    cy.contains("h1", `${t.dashboard.greeting}, ${firstName}`).should("be.visible");
  }
);

Cypress.Commands.add("getFamilyInviteCode", (userId: string) => {
  return cy.task<string>("getFamilyInviteCode", { userId });
});

Cypress.Commands.add(
  "completeOnboardingSolo",
  ({
    firstName = "Jan",
    lastName = "Nowak",
    colorId = "sea",
  } = {}) => {
    cy.url().should("include", "/onboarding");
    cy.contains("h2", t.onboarding.colorTitle).should("be.visible");
    cy.get(`button[aria-label="${colorId}"]`).click();
    cy.contains("button", t.onboarding.next).click();

    cy.get("#firstName").clear().type(firstName);
    cy.get("#lastName").clear().type(lastName);
    cy.contains("button", t.onboarding.next).click();

    cy.contains("button", t.onboarding.soloTitle).click();
    cy.contains("button", t.onboarding.finish).click();

    cy.url().should("include", "/dashboard");
    cy.contains("h1", `${t.dashboard.greeting}, ${firstName}`).should("be.visible");
  }
);

Cypress.Commands.add(
  "setupOnboardedFamilyUser",
  ({
    prefix = "e2e-family",
    firstName = "Anna",
    lastName = "Kowalska",
    familyName = "Rodzina Kowalskich",
    colorId = "forest",
  } = {}) => {
    return cy.createTestUser({ prefix }).then((user) => {
      cy.login(user.email, user.password);
      cy.visit("/onboarding");
      cy.completeOnboardingFamily({ firstName, lastName, familyName, colorId });
      return cy.wrap(user);
    });
  }
);

Cypress.Commands.add(
  "setupOnboardedSoloUser",
  ({
    prefix = "e2e-solo",
    firstName = "Jan",
    lastName = "Nowak",
    colorId = "sea",
  } = {}) => {
    return cy.createTestUser({ prefix }).then((user) => {
      cy.login(user.email, user.password);
      cy.visit("/onboarding");
      cy.completeOnboardingSolo({ firstName, lastName, colorId });
      return cy.wrap(user);
    });
  }
);

export { };
