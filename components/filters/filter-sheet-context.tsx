"use client";

import { createContext, useContext, type ReactNode } from "react";

interface FilterSheetContextValue {
  close: () => void;
}

const FilterSheetContext = createContext<FilterSheetContextValue | null>(null);

export function FilterSheetProvider({
  close,
  children,
}: {
  close: () => void;
  children: ReactNode;
}) {
  return (
    <FilterSheetContext.Provider value={{ close }}>{children}</FilterSheetContext.Provider>
  );
}

export function useFilterSheet() {
  return useContext(FilterSheetContext);
}
