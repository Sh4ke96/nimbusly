import { t } from "../support/texts";

describe("Strona offline", () => {
  it("ładuje treść bez logowania", () => {
    cy.visit("/offline");
    cy.contains("h1", t.pwa.offlineTitle).should("be.visible");
    cy.contains("a", t.pwa.offlineHome).should("have.attr", "href", "/dashboard");
    cy.url().should("include", "/offline");
    cy.contains("Zaloguj się").should("not.exist");
  });
});
