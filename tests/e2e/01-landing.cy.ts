describe("Strona główna", () => {
  it("ładuje landing i pokazuje główne sekcje", () => {
    cy.visit("/");
    cy.contains("Wszystko, co dzieje się w domu").should("be.visible");
    cy.contains("Wypróbuj Nimbusly bez rejestracji").should("be.visible");
    cy.contains("Dwanaście modułów pod jednym dachem").should("be.visible");
    cy.contains("Nimbus - przewodnik, który zna Twój dom").should("be.visible");
    cy.contains("Trzy kroki do rodzinnego porządku").should("be.visible");
  });

  it("pokazuje interaktywne demo na stronie głównej", () => {
    cy.visit("/");
    cy.get("[data-demo-shell]").should("be.visible");
    cy.contains("Tryb demonstracyjny").should("be.visible");
    cy.contains("Mleko 2%").should("be.visible");
  });

  it("linkuje do pełnego demo i sekcji demo w nawigacji", () => {
    cy.visit("/");
    cy.contains("a", "Demo").should("have.attr", "href", "#demo");
    cy.contains("a", "Pełne demo").should("have.attr", "href", "/demo");
  });

  it("pokazuje uczciwe informacje zamiast fałszywego social proof", () => {
    cy.visit("/");
    cy.contains("Powiadomienia push na ekranie blokady").should("be.visible");
    cy.contains("12 modułów w jednym hubie").should("be.visible");
    cy.contains("12 000").should("not.exist");
    cy.contains("4.9/5").should("not.exist");
  });

  it("ma linki do logowania i rejestracji", () => {
    cy.visit("/");
    cy.contains("a", "Zaloguj się").should("have.attr", "href", "/login");
    cy.contains("a", "Zacznij za darmo").should("have.attr", "href", "/register");
  });

  it("linkuje do sekcji Nimbusa w nawigacji", () => {
    cy.visit("/");
    cy.contains("a", "Nimbus").should("have.attr", "href", "#nimbus");
  });

  it("linkuje do historii zmian w stopce", () => {
    cy.visit("/");
    cy.contains("a", "Historia zmian").should("have.attr", "href", "/change-log");
  });
});
