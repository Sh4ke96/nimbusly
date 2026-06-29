import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Zakupy — powiadomienie modułu zakupów", () => {
  let owner: CreatedTestUser;
  let member: CreatedTestUser;
  const listName = "Lista E2E powiadomień";
  const itemName = "mleko";

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "shopping-module-owner",
      firstName: "Owner",
      lastName: "Zakupy",
      familyName: "Rodzina Powiadomień",
    }).then((user) => {
      owner = user;
    });
  });

  after(() => {
    if (member?.userId) cy.deleteTestUser(member.userId);
    if (owner?.userId) cy.deleteTestUser(owner.userId);
  });

  it("członek rodziny dostaje wpis w /notifications gdy inny doda pozycję (moduł zakupów)", () => {
    cy.login(owner.email, owner.password);
    cy.visit("/shopping");
    cy.contains("button", "Nowa lista").click();
    cy.contains('[role="dialog"]', "Nowa lista zakupów").should("be.visible");
    cy.get("#shopping-list-name").clear().type(listName);
    cy.contains('[role="dialog"] button', "Zapisz listę").click();
    cy.contains(listName).should("be.visible");

    cy.getFamilyInviteCode(owner.userId).then((inviteCode) => {
      cy.createTestUser({ prefix: "shopping-module-joiner" }).then((user) => {
        member = user;
        cy.login(member.email, member.password);
        cy.visit("/onboarding");
        cy.completeOnboardingJoin({
          firstName: "Member",
          lastName: "Rodzina",
          inviteCode,
        });

        cy.login(owner.email, owner.password);
        cy.visit("/shopping");
        cy.contains(listName).click();
        cy.get('input[placeholder="np. mleko, chleb, jajka…"]').type(itemName);
        cy.contains("button", "Dodaj").click();
        cy.contains(itemName).should("be.visible");

        cy.login(member.email, member.password);
        cy.visit("/notifications");
        cy.contains("h1", t.notifications.title).should("be.visible");
        cy.contains(listName).should("be.visible");
        cy.contains(itemName).should("be.visible");
      });
    });
  });
});
