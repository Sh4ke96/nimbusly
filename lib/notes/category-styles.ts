import { cn } from "@/lib/utils";

export function noteCategoryChipClass(selected: boolean): string {
  return cn(
    "inline-flex max-w-full min-w-0 items-center gap-1 rounded-sm px-1.5 py-1 text-[11px] font-medium leading-none transition-all duration-150",
    selected
      ? "bg-amber-600 text-white ring-1 ring-amber-600/40"
      : "bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 dark:text-amber-200"
  );
}
