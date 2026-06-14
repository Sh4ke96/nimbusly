import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidBudgetExpenseCategory,
  isValidBudgetIncomeCategory,
  isValidBudgetName,
  isValidExpenseDateString,
  parseBudgetAmount,
} from "@/lib/budget/types";
import {
  BUDGET_EXPENSE_CATEGORY,
  BUDGET_INCOME_CATEGORY,
} from "@/lib/constants/budget";

describe("isValidBudgetName", () => {
  it("requires non-empty names", () => {
    assert.equal(isValidBudgetName("Dom"), true);
    assert.equal(isValidBudgetName("   "), false);
  });
});

describe("isValidBudgetExpenseCategory", () => {
  it("accepts known expense categories", () => {
    assert.equal(isValidBudgetExpenseCategory(BUDGET_EXPENSE_CATEGORY.WORK), true);
    assert.equal(
      isValidBudgetExpenseCategory(BUDGET_EXPENSE_CATEGORY.SUBSCRIPTIONS),
      true
    );
    assert.equal(isValidBudgetExpenseCategory("unknown"), false);
  });
});

describe("isValidBudgetIncomeCategory", () => {
  it("accepts known income categories", () => {
    assert.equal(isValidBudgetIncomeCategory(BUDGET_INCOME_CATEGORY.SALARY), true);
    assert.equal(isValidBudgetIncomeCategory("unknown"), false);
  });
});

describe("parseBudgetAmount", () => {
  it("parses positive decimal amounts", () => {
    assert.equal(parseBudgetAmount("12,50"), 12.5);
    assert.equal(parseBudgetAmount("0"), null);
    assert.equal(parseBudgetAmount("-5"), null);
  });
});

describe("isValidExpenseDateString", () => {
  it("validates ISO dates", () => {
    assert.equal(isValidExpenseDateString("2026-06-14"), true);
    assert.equal(isValidExpenseDateString("2026-13-01"), false);
  });
});
