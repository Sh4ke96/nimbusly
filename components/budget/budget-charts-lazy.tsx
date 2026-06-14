"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComponentProps } from "react";
import type { BudgetCharts } from "@/components/budget/budget-charts";

const BudgetChartsDynamic = dynamic(
  () => import("@/components/budget/budget-charts").then((m) => m.BudgetCharts),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-none" />,
  }
);

export function BudgetChartsLazy(props: ComponentProps<typeof BudgetCharts>) {
  return <BudgetChartsDynamic {...props} />;
}
