export function parseSameOriginHref(href: string, baseUrl: string): URL | null {
  try {
    const url = new URL(href, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function isSameDocumentNavigation(
  target: URL,
  pathname: string,
  search: string,
): boolean {
  const currentSearch = search ? `?${search}` : "";
  return target.pathname === pathname && target.search === currentSearch;
}

export function shouldStartNavigationTransition(
  href: string | null,
  baseUrl: string,
  pathname: string,
  search: string,
): boolean {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  const target = parseSameOriginHref(href, baseUrl);
  if (!target) {
    return false;
  }

  const base = parseSameOriginHref(baseUrl, baseUrl);
  if (!base || target.origin !== base.origin) {
    return false;
  }

  return !isSameDocumentNavigation(target, pathname, search);
}
