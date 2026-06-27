import packageJson from "../../package.json";

describe("Historia zmian", () => {
  it("ładuje stronę bez logowania", () => {
    cy.visit("/change-log");
    cy.contains("Historia zmian").should("be.visible");
    cy.contains(`v${packageJson.version}`).should("be.visible");
  });

  it("nie przekierowuje na login", () => {
    cy.visit("/change-log");
    cy.url().should("include", "/change-log");
    cy.contains("Zaloguj się").should("not.exist");
  });
});
