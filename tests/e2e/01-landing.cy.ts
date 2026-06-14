describe("Strona główna", () => {
  it("ładuje landing i pokazuje główne sekcje", () => {
    cy.visit("/");
    cy.contains("Wszystko, co dzieje się w domu").should("be.visible");
    cy.contains("Jedenaście modułów pod jednym dachem").should("be.visible");
    cy.contains("Trzy kroki do rodzinnego porządku").should("be.visible");
  });

  it("ma linki do logowania i rejestracji", () => {
    cy.visit("/");
    cy.contains("a", "Zaloguj się").should("have.attr", "href", "/login");
    cy.contains("a", "Zacznij za darmo").should("have.attr", "href", "/register");
  });
});
