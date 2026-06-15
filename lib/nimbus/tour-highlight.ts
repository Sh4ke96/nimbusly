const ACTIVE_CLASS = "nimbus-tour-target-active";

let activeTarget: HTMLElement | null = null;

export function setTourHighlightTarget(element: HTMLElement | null) {
  if (activeTarget === element) return;
  activeTarget?.classList.remove(ACTIVE_CLASS);
  element?.classList.add(ACTIVE_CLASS);
  activeTarget = element;
}

export function clearTourHighlightTarget() {
  setTourHighlightTarget(null);
}
