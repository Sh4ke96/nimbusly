/** Opens print preview via hidden iframe - avoids browser headers with URL/title. */
export function openPrintWindow(html: string): boolean {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "print");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const doc = frameWindow?.document;
  if (!frameWindow || !doc) {
    iframe.remove();
    return false;
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    iframe.remove();
  };

  doc.open();
  doc.write(html);
  doc.close();

  window.setTimeout(() => {
    frameWindow.focus();
    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    frameWindow.print();
    window.setTimeout(cleanup, 60_000);
  }, 150);

  return true;
}
