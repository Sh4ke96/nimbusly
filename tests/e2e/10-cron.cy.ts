describe("Cron reminders API", () => {
  const cronRoutes = [
    "/api/cron/reminders",
    "/api/cron/budget-payment-reminders",
  ] as const;

  cronRoutes.forEach((route) => {
    it(`odrzuca ${route} bez poprawnego sekretu`, () => {
      cy.request({
        url: route,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property("error", "Unauthorized");
      });
    });

    it(`odrzuca ${route} z niepoprawnym nagłówkiem Authorization`, () => {
      cy.request({
        url: route,
        headers: { Authorization: "Bearer invalid-secret" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
