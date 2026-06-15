import { cn } from "@/lib/utils";

/** Sidebar / picker cards (shopping lists, budgets, gifts). */
export function selectionCardClasses(selected: boolean) {
  return cn(
    selected && "border-2 border-accent bg-card shadow-md ring-2 ring-accent/45"
  );
}

/** List-row pickers (schedule, birthdays). */
export function selectionListRowClasses(selected: boolean) {
  return cn(
    selected
      ? "border-l-4 border-l-accent bg-card shadow-sm ring-1 ring-accent/30"
      : "border-l-transparent"
  );
}

/** Compact calendar / day pills. */
export function selectionPillClasses(selected: boolean) {
  return cn(
    selected
      ? "border-2 border-accent bg-card text-foreground shadow-sm ring-2 ring-accent/50"
      : "border border-transparent bg-primary/10 text-primary hover:bg-primary/20 hover:ring-1 hover:ring-primary/20"
  );
}

/** Grid tile pickers (e.g. schedule entry type). */
export function selectionPickerTileClasses(selected: boolean) {
  return cn(
    selected
      ? "border-2 border-accent bg-card shadow-sm ring-1 ring-accent/30"
      : "border border-border bg-background hover:bg-muted/60"
  );
}

const SELECTION_PICKER_TILE_BUTTON_BASE =
  "flex cursor-pointer items-center rounded-none px-3 py-2.5 text-left text-sm font-medium transition-colors";

/** Grid tile button — combines base layout with {@link selectionPickerTileClasses}. */
export function selectionPickerTileButtonClasses(
  selected: boolean,
  className?: string
): string {
  return cn(SELECTION_PICKER_TILE_BUTTON_BASE, selectionPickerTileClasses(selected), className);
}
