/** Hide the static PWA splash via CSS — do not `.remove()` the node (React owns it). */
export function removeStaticPwaSplash(): void {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-app-ready", "");
}
