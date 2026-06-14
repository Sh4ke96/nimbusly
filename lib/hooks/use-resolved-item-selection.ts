import { useMemo, useState } from "react";

/** User-picked id with fallback to the first item when idsKey loads or changes. */
export function useResolvedItemSelection(
  idsKey: string
): [string | null, (id: string) => void] {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = useMemo(() => {
    const itemIds = idsKey ? idsKey.split("|") : [];
    if (itemIds.length === 0) return null;
    if (selectedId && itemIds.includes(selectedId)) return selectedId;
    return itemIds[0] ?? null;
  }, [idsKey, selectedId]);

  return [activeId, setSelectedId];
}
