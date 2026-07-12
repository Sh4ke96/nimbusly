export function buildRouteKey(pathname: string, search: string): string {
  return `${pathname}?${search}`;
}

export function getWindowRouteKey(): string {
  const raw = window.location.search;
  const search = raw.startsWith("?") ? raw.slice(1) : raw;
  return buildRouteKey(window.location.pathname, search);
}
