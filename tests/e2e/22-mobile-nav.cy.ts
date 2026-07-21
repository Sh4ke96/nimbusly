import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Mobile navigation", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedSoloUser({
      prefix: "mobile-nav",
      firstName: "Marta",
      lastName: "Mobile",
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
    cy.viewport(375, 812);
    cy.login(testUser.email, testUser.password);
  });

  it("pokazuje dolną nawigację i otwiera sheet modułów", () => {
    cy.visit("/dashboard");
    cy.get(`nav[aria-label="${t.mobileNav.ariaLabel}"]`).should("be.visible");
    cy.contains("button", t.mobileNav.modules).click();
    cy.contains('[data-slot="sheet-title"]', t.mobileNav.modules).should("be.visible");
  });

  it("otwiera moduły przez deep link ?view=modules", () => {
    cy.visit("/dashboard?view=modules");
    cy.url().should("not.include", "view=modules");
    cy.contains('[data-slot="sheet-title"]', t.mobileNav.modules).should("be.visible");
  });

  it("synchronizuje zakładki desktop z parametrem view", () => {
    cy.viewport(1280, 800);
    cy.visit("/dashboard");
    cy.contains('[role="tab"]', t.dashboard.modules).click();
    cy.url().should("include", "view=modules");
    cy.contains('[role="tab"]', t.dashboard.overviewHeading).click();
    cy.url().should("not.include", "view=modules");
  });
});
