export function formatNimbusSessionGreeting(
  templates: readonly string[],
  displayName: string | null | undefined
): string {
  if (templates.length === 0) return "";

  const template = templates[Math.floor(Math.random() * templates.length)];
  const name = displayName?.trim();

  if (name) {
    return template.replace(/\{name\}/g, name);
  }

  return template
    .replace(/,?\s*\{name\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function pickRandomNimbusJoke(jokes: readonly string[]): string | null {
  if (jokes.length === 0) return null;
  return jokes[Math.floor(Math.random() * jokes.length)] ?? null;
}
