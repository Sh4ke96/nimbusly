import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Medicine cabinet module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "medicine",
      firstName: "Maja",
      lastName: "Lek",
      familyName: "Rodzina Lek",
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
    cy.visit("/medicine-cabinet");
  });

  it("pokazuje nagłówek modułu apteczki", () => {
    cy.contains("h1", t.medicineCabinet.title).should("be.visible");
    cy.contains("p", t.medicineCabinet.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania leku", () => {
    cy.contains("button", t.medicineCabinet.addBtn).click();
    cy.contains('[role="dialog"]', t.medicineCabinet.addTitle).should("be.visible");
  });
});
