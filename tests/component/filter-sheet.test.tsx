import "./setup.ts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import { FilterSheet } from "@/components/filters/filter-sheet";
import { LangProvider } from "@/lib/lang-context";
import { LANG } from "@/lib/constants/lang";
import { pl } from "@/lib/i18n/pl";

describe("FilterSheet", () => {
  it("renders trigger with active filter count", () => {
    render(
      <LangProvider initialLang={LANG.PL}>
        <FilterSheet title="Filtry testowe" activeCount={2}>
          <p>Treść filtrów</p>
        </FilterSheet>
      </LangProvider>
    );

    assert.ok(screen.getByRole("button", { name: pl.common.filters }));
    assert.ok(screen.getByText("2"));
  });
});
