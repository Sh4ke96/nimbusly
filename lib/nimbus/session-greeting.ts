const SESSION_GREETING_KEY = "nimbusly:session-greeting-shown";

function getSessionStorage(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

export function shouldShowSessionGreeting(): boolean {
  const storage = getSessionStorage();
  if (!storage) return false;
  return storage.getItem(SESSION_GREETING_KEY) !== "1";
}

export function markSessionGreetingShown(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.setItem(SESSION_GREETING_KEY, "1");
}
