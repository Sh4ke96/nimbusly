export async function waitForServiceWorkerControl(
  registration: ServiceWorkerRegistration,
  timeoutMs = 8000
): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  if (navigator.serviceWorker.controller) {
    return true;
  }

  const worker =
    registration.active ?? registration.installing ?? registration.waiting;

  if (worker && worker.state !== "activated") {
    await new Promise<void>((resolve) => {
      const onStateChange = () => {
        if (worker.state === "activated") {
          worker.removeEventListener("statechange", onStateChange);
          resolve();
        }
      };
      worker.addEventListener("statechange", onStateChange);
      if (worker.state === "activated") {
        worker.removeEventListener("statechange", onStateChange);
        resolve();
      }
    });
  }

  if (navigator.serviceWorker.controller) {
    return true;
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(false), timeoutMs);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.clearTimeout(timer);
        resolve(Boolean(navigator.serviceWorker.controller));
      },
      { once: true }
    );
  });
}
