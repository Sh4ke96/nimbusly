import type { CreatedTestUser } from "../support/commands";
import { t } from "../support/texts";

describe("PWA install prompt", () => {
  let testUser: CreatedTestUser;

  before(() => {
    cy.setupOnboardedSoloUser({
      prefix: "pwa-install",
      firstName: "Pwa",
      lastName: "Install",
    }).then((user) => {
      testUser = user;
    });
  });

  after(() => {
    if (testUser?.userId) {
      cy.deleteTestUser(testUser.userId);
    }
  });

  it("pokazuje prompt po zdarzeniu beforeinstallprompt", () => {
    cy.login(testUser.email, testUser.password);
    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("nimbusly:pwa-install-dismissed");
      },
    });

    cy.window().then((win) => {
      const event = new Event("beforeinstallprompt", { cancelable: true });
      Object.assign(event, {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: "dismissed" as const }),
      });
      win.dispatchEvent(event);
    });

    cy.get('[data-testid="pwa-install-prompt"]').should("be.visible");
    cy.contains("button", t.pwa.installBtn).should("be.visible");
    cy.contains("button", t.pwa.installDismiss).click();
    cy.get('[data-testid="pwa-install-prompt"]').should("not.exist");
  });
});
