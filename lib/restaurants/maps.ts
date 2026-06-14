export function buildGoogleMapsEmbedUrl(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}

export function buildGoogleMapsOpenUrl(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
