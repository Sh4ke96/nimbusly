import { SETTINGS_TAB } from "../support/app-constants";
import { t } from "../support/texts";

describe("Zaproszenia do rodziny", () => {
  let owner: import("../support/commands").CreatedTestUser;
  let joiner: import("../support/commands").CreatedTestUser;

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "invite-owner",
      firstName: "Owner",
      lastName: "Rodziny",
      familyName: "Rodzina Invite",
    }).then((user) => {
      owner = user;
    });
  });

  after(() => {
    if (joiner?.userId) cy.deleteTestUser(joiner.userId);
    if (owner?.userId) cy.deleteTestUser(owner.userId);
  });

  it("pokazuje kod zaproszenia właścicielowi rodziny", () => {
    cy.login(owner.email, owner.password);
    cy.visit(`/profile/settings?tab=${SETTINGS_TAB.FAMILY}`);
    cy.contains("h1", t.account.settingsTitle).should("be.visible");
    cy.contains(t.account.familyInviteCode).should("be.visible");
    cy.get("code").should("match", /[A-Z0-9]{4}-[A-Z0-9]{4}/);
  });

  it("pozwala dołączyć do rodziny kodem podczas onboardingu", () => {
    cy.getFamilyInviteCode(owner.userId).then((inviteCode) => {
      cy.createTestUser({ prefix: "invite-joiner" }).then((user) => {
        joiner = user;
        cy.login(joiner.email, joiner.password);
        cy.visit("/onboarding");
        cy.completeOnboardingJoin({
          firstName: "Nowy",
          lastName: "Członek",
          inviteCode,
        });
      });
    });
  });

  it("właściciel widzi nowego członka rodziny", () => {
    cy.login(owner.email, owner.password);
    cy.visit(`/profile/settings?tab=${SETTINGS_TAB.FAMILY}`);
    cy.contains("Nowy Członek").should("be.visible");
  });

  it("właściciel może wysłać zaproszenie email", () => {
    cy.login(owner.email, owner.password);
    cy.visit(`/profile/settings?tab=${SETTINGS_TAB.FAMILY}`);
    cy.get("#family-invite-email").type("zaproszenie@example.com");
    cy.contains("button", t.account.familyInviteSend).click();
    cy.get("body").should("contain.text", "zaproszenie@example.com");
  });
});
