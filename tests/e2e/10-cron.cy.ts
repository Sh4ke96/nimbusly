describe("Cron reminders API", () => {
  it("odrzuca żądanie bez poprawnego sekretu", () => {
    cy.request({
      url: "/api/cron/reminders",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("error", "Unauthorized");
    });
  });

  it("odrzuca żądanie z niepoprawnym nagłówkiem Authorization", () => {
    cy.request({
      url: "/api/cron/reminders",
      headers: { Authorization: "Bearer invalid-secret" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
