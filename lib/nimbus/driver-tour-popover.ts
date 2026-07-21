import type { Driver, PopoverDOM } from "driver.js";
import type { Dict } from "@/lib/i18n/types";
import { getNimbusDriverStepData } from "@/lib/nimbus/build-driver-steps";
import {
  resolveNimbusTourStepCopy,
  resolveNimbusTourSummaryCopy,
} from "@/lib/nimbus/tour-copy";

function createSummaryLists(t: Dict, copyKey: string): HTMLElement | null {
  const summary = resolveNimbusTourSummaryCopy(t, copyKey);
  if (!summary) return null;

  const grid = document.createElement("div");
  grid.className = "mt-4 grid gap-3 sm:grid-cols-2";

  const learnedPanel = document.createElement("div");
  learnedPanel.className = "border border-border bg-muted/30 p-3 space-y-2";
  const learnedTitle = document.createElement("p");
  learnedTitle.className =
    "text-xs font-semibold uppercase tracking-wide text-primary";
  learnedTitle.textContent = t.nimbusTour.summaryLearned;
  const learnedList = document.createElement("ul");
  learnedList.className = "space-y-1.5 text-sm text-foreground";
  for (const item of summary.learned) {
    const li = document.createElement("li");
    li.className = "flex gap-2 leading-snug";
    const bullet = document.createElement("span");
    bullet.className = "text-primary shrink-0";
    bullet.textContent = "·";
    const text = document.createElement("span");
    text.textContent = item;
    li.append(bullet, text);
    learnedList.appendChild(li);
  }
  learnedPanel.append(learnedTitle, learnedList);

  const nextPanel = document.createElement("div");
  nextPanel.className = "border border-border bg-muted/30 p-3 space-y-2";
  const nextTitle = document.createElement("p");
  nextTitle.className =
    "text-xs font-semibold uppercase tracking-wide text-primary";
  nextTitle.textContent = t.nimbusTour.summaryNext;
  const nextList = document.createElement("ul");
  nextList.className = "space-y-1.5 text-sm text-foreground";
  for (const item of summary.next) {
    const li = document.createElement("li");
    li.className = "flex gap-2 leading-snug";
    const bullet = document.createElement("span");
    bullet.className = "text-primary shrink-0";
    bullet.textContent = "·";
    const text = document.createElement("span");
    text.textContent = item;
    li.append(bullet, text);
    nextList.appendChild(li);
  }
  nextPanel.append(nextTitle, nextList);

  grid.append(learnedPanel, nextPanel);
  return grid;
}

function createNimbusPopoverAvatar(): HTMLElement {
  const avatar = document.createElement("span");
  avatar.className = "nimbus-driver-popover-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.innerHTML = `<svg viewBox="0 0 512 512" width="36" height="36" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="nimbus-driver-avatar-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#618764"/><stop offset="100%" stop-color="#2B5748"/></linearGradient></defs><rect width="512" height="512" rx="128" ry="128" fill="url(#nimbus-driver-avatar-bg)"/><path d="M256 104 L424 234 L424 422 L88 422 L88 234 Z" fill="#F6F8F2"/><polygon points="256,76 448,242 64,242" fill="#F6F8F2"/><rect x="216" y="312" width="80" height="110" rx="40" ry="40" fill="#2B5748"/><path d="M256 202 C256 202 230 180 217 191 C204 202 204 222 217 234 L256 268 L295 234 C308 222 308 202 295 191 C282 180 256 202 256 202 Z" fill="#618764"/></svg>`;
  return avatar;
}

function decorateTourButtons(popover: PopoverDOM, driver: Driver, t: Dict) {
  const isLast = driver.isLastStep();
  popover.previousButton.textContent = t.nimbusTour.back;
  popover.nextButton.textContent = isLast
    ? t.nimbusTour.finish
    : t.nimbusTour.next;
}

function ensurePopoverLayout(popover: PopoverDOM) {
  let content = popover.wrapper.querySelector<HTMLElement>(
    ".nimbus-driver-popover-content"
  );
  if (!content) {
    content = document.createElement("div");
    content.className = "nimbus-driver-popover-content";
    popover.wrapper.insertBefore(content, popover.footer);
  }

  let header = content.querySelector<HTMLElement>(".nimbus-driver-popover-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "nimbus-driver-popover-header";
    header.append(
      createNimbusPopoverAvatar(),
      document.createElement("div")
    );
    const headerCopy = header.lastElementChild as HTMLElement;
    headerCopy.className = "nimbus-driver-popover-header-copy";
    content.append(header);
  }

  const headerCopy = header.querySelector<HTMLElement>(
    ".nimbus-driver-popover-header-copy"
  );
  if (!headerCopy) return content;

  if (popover.title.parentElement !== headerCopy) {
    headerCopy.append(popover.title);
  }
  if (popover.description.parentElement !== content) {
    content.append(popover.description);
  }
  popover.description.classList.add("nimbus-driver-popover-description");

  return content;
}

export function decorateNimbusDriverPopover(
  popover: PopoverDOM,
  t: Dict,
  driver: Driver,
  targetMissing: boolean
) {
  const activeStep = driver.getActiveStep();
  const meta = activeStep ? getNimbusDriverStepData(activeStep) : null;
  const nimbusStep = meta?.step;
  const copy = nimbusStep ? resolveNimbusTourStepCopy(t, nimbusStep.copyKey) : null;
  const isSummary = nimbusStep?.variant === "summary";
  const activeIndex = driver.getActiveIndex() ?? 0;
  const total = driver.getConfig().steps?.length ?? 0;

  popover.wrapper.classList.add("nimbus-driver-popover");

  const content = ensurePopoverLayout(popover);
  const headerCopy = content.querySelector<HTMLElement>(
    ".nimbus-driver-popover-header-copy"
  );
  if (!headerCopy) return;

  let badge = headerCopy.querySelector<HTMLElement>(".nimbus-driver-popover-badge");
  if (!badge) {
    badge = document.createElement("p");
    badge.className = "nimbus-driver-popover-badge";
    headerCopy.insertBefore(badge, popover.title);
  }
  badge.textContent = `${isSummary ? t.nimbusTour.summaryBadge : t.nimbusTour.badge} · ${activeIndex + 1}/${total}`;

  if (targetMissing && copy && nimbusStep?.variant !== "summary") {
    popover.description.textContent = meta?.targetMissingLabel ?? copy.body;
  }

  if (isSummary && nimbusStep) {
    const existingLists = popover.description.querySelector(
      ".nimbus-driver-summary-lists"
    );
    existingLists?.remove();
    const lists = createSummaryLists(t, nimbusStep.copyKey);
    if (lists) {
      lists.classList.add("nimbus-driver-summary-lists");
      popover.description.append(lists);
    }
  }

  let hint = popover.wrapper.querySelector<HTMLElement>(".nimbus-driver-keyboard-hint");
  if (!hint) {
    hint = document.createElement("p");
    hint.className = "nimbus-driver-keyboard-hint";
    popover.footer.insertAdjacentElement("beforebegin", hint);
  }
  hint.textContent = t.nimbusTour.keyboardHint;

  decorateTourButtons(popover, driver, t);
  popover.closeButton.setAttribute("aria-label", t.nimbusTour.closeAria);
}
