import { formatBudgetAmount } from "@/lib/budget/aggregates";
import type { Lang } from "@/lib/constants/lang";

function tooltipAmount(value: unknown): number {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }
  return Number(value ?? 0);
}

export function budgetChartTooltipFormatter(
  value: unknown,
  lang: Lang,
  valueLabel: string
): [string, string] {
  return [formatBudgetAmount(tooltipAmount(value), lang), valueLabel];
}
