import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { budgetChartTooltipFormatter } from "@/lib/budget/chart-tooltip";

describe("budgetChartTooltipFormatter", () => {
  it("formats amount and uses value label", () => {
    const [amount, label] = budgetChartTooltipFormatter(1234.5, "pl", "Suma");
    assert.match(amount, /1/);
    assert.equal(label, "Suma");
  });

  it("handles array values from recharts", () => {
    const [amount] = budgetChartTooltipFormatter([99], "en", "Total");
    assert.match(amount, /99/);
  });
});
