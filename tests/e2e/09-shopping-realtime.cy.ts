import type { CreatedTestUser } from "../support/commands";

describe("Zakupy - realtime", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "shopping-realtime",
      firstName: "Ewa",
      lastName: "Zakupy",
      familyName: "Rodzina Zakupowa",
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
    cy.visit("/shopping");
  });

  it("pokazuje podpowiedź o synchronizacji na żywo w trybie rodzinnym", () => {
    cy.contains("na żywo").should("be.visible");
  });
});
