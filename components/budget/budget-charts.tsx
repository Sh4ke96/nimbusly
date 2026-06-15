"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CARD_TITLE_ROW_CLASSNAME } from "@/components/ui/card";
import { BRAND_COLOR } from "@/lib/constants/brand";
import {
  BUDGET_CATEGORY_COLORS,
  BUDGET_ENTRY_TYPE,
  BUDGET_EXPENSE_COLOR,
  BUDGET_FILTER_ALL,
  type BudgetCategory,
  type BudgetExpenseCategory,
  type BudgetIncomeCategory,
} from "@/lib/constants/budget";
import {
  aggregateExpensesByCategory,
  aggregateIncomeByCategory,
  sumExpensesOnly,
  sumIncomeOnly,
} from "@/lib/budget/aggregates";
import { budgetChartTooltipFormatter } from "@/lib/budget/chart-tooltip";
import { BudgetResponsiveChart } from "@/components/budget/budget-responsive-chart";
import type { BudgetExpense } from "@/lib/budget/types";
import { useLang, useT } from "@/lib/lang-context";
import { cn } from "@/lib/utils";

interface BudgetChartsProps {
  entries: BudgetExpense[];
  typeFilter?: string;
  heading?: string;
}

export function BudgetCharts({
  entries,
  typeFilter = BUDGET_FILTER_ALL,
  heading,
}: BudgetChartsProps) {
  const t = useT();
  const { lang } = useLang();

  const incomeTotal = sumIncomeOnly(entries);
  const expenseTotal = sumExpensesOnly(entries);

  if (typeFilter === BUDGET_FILTER_ALL) {
    const comparisonData = [
      {
        key: BUDGET_ENTRY_TYPE.INCOME,
        name: t.budget.incomeLabel,
        total: incomeTotal,
        fill: BRAND_COLOR.PRIMARY,
      },
      {
        key: BUDGET_ENTRY_TYPE.EXPENSE,
        name: t.budget.expensesLabel,
        total: expenseTotal,
        fill: BUDGET_EXPENSE_COLOR,
      },
    ].filter((row) => row.total > 0);

    if (comparisonData.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border">
          {t.budget.chartsEmpty}
        </p>
      );
    }

    const compareTitle = heading ?? t.budget.chartCompareTitle;

    return (
      <Card className="rounded-none py-0 shadow-sm">
        <CardHeader>
          <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "text-sm")}>{compareTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 flex-col p-4">
          <BudgetResponsiveChart className="min-h-0 flex-1">
            <BarChart data={comparisonData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} width={56} />
              <Tooltip
                formatter={(value) =>
                  budgetChartTooltipFormatter(value, lang, t.budget.totalLabel)
                }
              />
              <Bar dataKey="total" name={t.budget.totalLabel} radius={0}>
                {comparisonData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </BudgetResponsiveChart>
        </CardContent>
      </Card>
    );
  }

  const isIncomeView = typeFilter === BUDGET_ENTRY_TYPE.INCOME;
  const rows = (
    isIncomeView
      ? aggregateIncomeByCategory(entries)
      : aggregateExpensesByCategory(entries)
  ).filter((row) => row.total > 0);

  const chartData = rows.map((row) => ({
    category: row.category,
    name: isIncomeView
      ? t.budget.incomeCategoryLabels[row.category as BudgetIncomeCategory]
      : t.budget.categoryLabels[row.category as BudgetExpenseCategory],
    total: row.total,
    fill: BUDGET_CATEGORY_COLORS[row.category as BudgetCategory],
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border">
        {t.budget.chartsEmpty}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {heading && (
        <h3 className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
          {heading}
        </h3>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-none py-0 shadow-sm">
        <CardHeader>
          <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "text-sm")}>
            {isIncomeView ? t.budget.chartIncomePieTitle : t.budget.chartPieTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 flex-col p-4">
          <BudgetResponsiveChart className="min-h-0 flex-1">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={88}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  budgetChartTooltipFormatter(value, lang, t.budget.totalLabel)
                }
              />
            </PieChart>
          </BudgetResponsiveChart>
        </CardContent>
      </Card>

      <Card className="rounded-none py-0 shadow-sm">
        <CardHeader>
          <CardTitle className={cn(CARD_TITLE_ROW_CLASSNAME, "text-sm")}>
            {isIncomeView ? t.budget.chartIncomeBarTitle : t.budget.chartBarTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 flex-col p-4">
          <BudgetResponsiveChart className="min-h-0 flex-1">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={56}
              />
              <YAxis tick={{ fontSize: 11 }} width={56} />
              <Tooltip
                formatter={(value) =>
                  budgetChartTooltipFormatter(value, lang, t.budget.totalLabel)
                }
              />
              <Bar dataKey="total" name={t.budget.totalLabel} radius={0}>
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </BudgetResponsiveChart>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
