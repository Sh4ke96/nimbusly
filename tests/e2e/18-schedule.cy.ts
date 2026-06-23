import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Schedule module", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "schedule",
      firstName: "Stefan",
      lastName: "Grafik",
      familyName: "Rodzina Grafik",
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
    cy.visit("/schedule");
  });

  it("pokazuje nagłówek modułu grafiku", () => {
    cy.contains("h1", t.schedule.title).should("be.visible");
    cy.contains("p", t.schedule.subtitle).should("be.visible");
  });

  it("otwiera formularz dodawania wpisu", () => {
    cy.contains("button", t.schedule.addBtn).click();
    cy.contains('[role="dialog"]', t.schedule.addTitle).should("be.visible");
  });
});
