import "../../component/setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NIMBUS_TOUR_ID } from "@/lib/constants/nimbus-tour";
import { NIMBUS_DRIVER_STEP_DATA_KEY } from "@/lib/nimbus/build-driver-steps";
import { decorateNimbusDriverPopover } from "@/lib/nimbus/driver-tour-popover";
import { getNimbusTourSteps } from "@/lib/nimbus/tour-catalog";
import { nimbusTourMessagesPl } from "@/lib/i18n/nimbus-messages";

function createMockDriver(options: { isLast?: boolean; index?: number }) {
  const catalogStep = getNimbusTourSteps(NIMBUS_TOUR_ID.INTRO)[0]!;
  const steps = [{}, {}, {}];

  return {
    getActiveIndex: () => options.index ?? 0,
    getConfig: () => ({ steps }),
    isLastStep: () => options.isLast ?? false,
    getActiveStep: () => ({
      data: {
        [NIMBUS_DRIVER_STEP_DATA_KEY]: {
          step: catalogStep,
          targetMissingLabel: "Brak celu",
        },
      },
    }),
  };
}

function createPopoverDom() {
  const wrapper = document.createElement("div");
  const title = document.createElement("header");
  title.className = "driver-popover-title";
  title.textContent = "Tytuł";
  const description = document.createElement("div");
  description.className = "driver-popover-description";
  description.textContent = "Opis";
  const footer = document.createElement("footer");
  footer.className = "driver-popover-footer";
  const previousButton = document.createElement("button");
  previousButton.className = "driver-popover-prev-btn";
  const nextButton = document.createElement("button");
  nextButton.className = "driver-popover-next-btn";
  const closeButton = document.createElement("button");
  closeButton.className = "driver-popover-close-btn";
  wrapper.append(title, description, footer, closeButton);
  footer.append(previousButton, nextButton);

  return {
    wrapper,
    arrow: document.createElement("div"),
    title,
    description,
    footer,
    progress: document.createElement("span"),
    previousButton,
    nextButton,
    closeButton,
    footerButtons: footer,
  };
}

describe("decorateNimbusDriverPopover", () => {
  it("builds header layout and keyboard hint", () => {
    const popover = createPopoverDom();
    const driver = createMockDriver({ index: 0, isLast: false });

    decorateNimbusDriverPopover(
      popover,
      { nimbusTour: nimbusTourMessagesPl } as never,
      driver as never,
      false
    );

    assert.ok(popover.wrapper.querySelector(".nimbus-driver-popover-header"));
    assert.ok(popover.wrapper.querySelector(".nimbus-driver-popover-avatar"));
    assert.ok(popover.description.classList.contains("nimbus-driver-popover-description"));
    assert.ok(popover.wrapper.querySelector(".nimbus-driver-keyboard-hint"));
    assert.equal(popover.previousButton.textContent, nimbusTourMessagesPl.back);
    assert.equal(popover.nextButton.textContent, nimbusTourMessagesPl.next);
  });
});
