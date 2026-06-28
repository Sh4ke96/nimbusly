import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("Zakupy — obserwacja listy i powiadomienie", () => {
  let owner: CreatedTestUser;
  let watcher: CreatedTestUser;
  const listName = "Lista E2E obserwacji";
  const itemName = "mleko";

  before(() => {
    cy.setupOnboardedFamilyUser({
      prefix: "shopping-watch-owner",
      firstName: "Owner",
      lastName: "Zakupy",
      familyName: "Rodzina Obserwacji",
    }).then((user) => {
      owner = user;
    });
  });

  after(() => {
    if (watcher?.userId) cy.deleteTestUser(watcher.userId);
    if (owner?.userId) cy.deleteTestUser(owner.userId);
  });

  it("watcher dostaje wpis w /notifications gdy inny członek doda pozycję", () => {
    cy.login(owner.email, owner.password);
    cy.visit("/shopping");
    cy.contains("button", "Nowa lista").click();
    cy.contains('[role="dialog"]', "Nowa lista zakupów").should("be.visible");
    cy.get("#shopping-list-name").clear().type(listName);
    cy.contains('[role="dialog"] button', "Zapisz listę").click();
    cy.contains(listName).should("be.visible");

    cy.getFamilyInviteCode(owner.userId).then((inviteCode) => {
      cy.createTestUser({ prefix: "shopping-watch-joiner" }).then((user) => {
        watcher = user;
        cy.login(watcher.email, watcher.password);
        cy.visit("/onboarding");
        cy.completeOnboardingJoin({
          firstName: "Watcher",
          lastName: "Obserwator",
          inviteCode,
        });

        cy.visit("/shopping");
        cy.contains(listName).click();
        cy.contains("button", "Obserwuj").click();
        cy.contains("button", "Przestań obserwować").should("be.visible");

        cy.login(owner.email, owner.password);
        cy.visit("/shopping");
        cy.contains(listName).click();
        cy.get('input[placeholder="np. mleko, chleb, jajka…"]').type(itemName);
        cy.contains("button", "Dodaj").click();
        cy.contains(itemName).should("be.visible");

        cy.login(watcher.email, watcher.password);
        cy.visit("/notifications");
        cy.contains("h1", t.notifications.title).should("be.visible");
        cy.contains(listName).should("be.visible");
        cy.contains(itemName).should("be.visible");
      });
    });
  });
});
