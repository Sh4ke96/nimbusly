const LANDING_HEADER_OFFSET_PX = 72;

export function scrollToLandingSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top + window.scrollY - LANDING_HEADER_OFFSET_PX;

  window.scrollTo({ top, behavior: "smooth" });
}
