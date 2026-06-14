"use client";

import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { BudgetResponsiveChart } from "@/components/budget/budget-responsive-chart";
import { budgetChartTooltipFormatter } from "@/lib/budget/chart-tooltip";
import type { Lang } from "@/lib/constants/lang";
import type { Dict } from "@/lib/i18n/types";

export interface BudgetOverviewMiniChartProps {
  data: { key: string; name: string; total: number; fill: string }[];
  lang: Lang;
  t: Dict;
}

export function BudgetOverviewMiniChart({ data, lang, t }: BudgetOverviewMiniChartProps) {
  return (
    <div className="box-border flex h-28 min-h-28 w-full min-w-0 flex-col border border-border bg-muted/20 p-2">
      <BudgetResponsiveChart className="min-h-0 flex-1">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis hide />
          <Tooltip
            formatter={(value) =>
              budgetChartTooltipFormatter(value, lang, t.budget.totalLabel)
            }
          />
          <Bar dataKey="total" name={t.budget.totalLabel} radius={0}>
            {data.map((row) => (
              <Cell key={row.key} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      </BudgetResponsiveChart>
    </div>
  );
}
