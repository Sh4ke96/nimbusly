import "../../component/setup";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { PWA_STARTUP_SPLASH_STATIC_ID } from "@/lib/constants/pwa";
import { removeStaticPwaSplash } from "@/lib/pwa/startup-splash";

describe("removeStaticPwaSplash", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-app-ready");
    document.getElementById(PWA_STARTUP_SPLASH_STATIC_ID)?.remove();
  });

  it("marks the app ready without removing the splash node from the DOM", () => {
    const splash = document.createElement("div");
    splash.id = PWA_STARTUP_SPLASH_STATIC_ID;
    document.body.appendChild(splash);

    removeStaticPwaSplash();

    assert.equal(document.documentElement.getAttribute("data-app-ready"), "");
    assert.equal(document.getElementById(PWA_STARTUP_SPLASH_STATIC_ID), splash);
  });
});
