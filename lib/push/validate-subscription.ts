const PUSH_ENDPOINT_MAX_LENGTH = 2048;
const PUSH_KEY_MAX_LENGTH = 512;

export function isValidPushSubscriptionInput(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): boolean {
  const { endpoint, keys } = input;

  if (typeof endpoint !== "string" || endpoint.length === 0 || endpoint.length > PUSH_ENDPOINT_MAX_LENGTH) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    if (process.env.NODE_ENV !== "production" && parsed.protocol === "http:") {
      // Local dev push services may use http.
    } else {
      return false;
    }
  }

  if (
    typeof keys.p256dh !== "string" ||
    keys.p256dh.length === 0 ||
    keys.p256dh.length > PUSH_KEY_MAX_LENGTH
  ) {
    return false;
  }

  if (typeof keys.auth !== "string" || keys.auth.length === 0 || keys.auth.length > PUSH_KEY_MAX_LENGTH) {
    return false;
  }

  return true;
}
