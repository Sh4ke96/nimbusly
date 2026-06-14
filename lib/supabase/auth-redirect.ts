const RESET_PASSWORD_PATH = "/reset-password";

export function getPasswordResetCallbackUrl(origin: string) {
  const next = encodeURIComponent(RESET_PASSWORD_PATH);
  return `${origin}/api/auth/callback?next=${next}`;
}
