import "./setup.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import { ModuleFetchError } from "@/components/ui/module-fetch-error";
import { LangProvider } from "@/lib/lang-context";
import { LANG } from "@/lib/constants/lang";
import { pl } from "@/lib/i18n/pl";

describe("ModuleFetchError", () => {
  it("renders retry label from i18n", () => {
    render(
      <LangProvider initialLang={LANG.PL}>
        <ModuleFetchError onRetry={() => undefined} />
      </LangProvider>
    );

    assert.ok(screen.getByText(pl.module.fetchError));
    assert.ok(screen.getByRole("button", { name: pl.module.retry }));
  });
});
