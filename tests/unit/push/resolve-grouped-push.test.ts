import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PUSH_BATCH_TAG_PREFIX } from "@/lib/constants/push-batch";
import { APP_MODULE } from "@/lib/constants/app-modules";
import { formatMessage } from "@/lib/i18n/format";
import { dict } from "@/lib/i18n";

describe("grouped push copy", () => {
  it("formats batch title in PL", () => {
    const title = formatMessage(dict.pl.notifications.groupedPushTitle, {
      actor: "Anna",
      count: "3",
      module: dict.pl.dashboard.moduleLabels.shopping,
    });

    assert.match(title, /Anna/);
    assert.match(title, /3/);
    assert.match(title, /Zakupy/);
  });

  it("formats batch title in EN", () => {
    const title = formatMessage(dict.en.notifications.groupedPushTitle, {
      actor: "Anna",
      count: "2",
      module: dict.en.dashboard.moduleLabels.shopping,
    });

    assert.match(title, /Anna/);
    assert.match(title, /2 changes in/);
  });

  it("builds stable batch tag per recipient, actor, and module", () => {
    const tag = `${PUSH_BATCH_TAG_PREFIX}:recipient-1:actor-1:${APP_MODULE.SHOPPING}`;
    assert.equal(tag, "nimbusly-batch:recipient-1:actor-1:shopping");
  });
});
