import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { excludeActorFromWatcherIds } from "@/lib/notifications/watches";

describe("watcher notification recipients", () => {
  it("notifies other watchers but not the actor", () => {
    const watcherIds = ["user-a", "user-b", "user-c"];
    const recipients = excludeActorFromWatcherIds(watcherIds, "user-b");
    assert.deepEqual(recipients, ["user-a", "user-c"]);
  });

  it("returns empty when only the actor watches the list", () => {
    const recipients = excludeActorFromWatcherIds(["user-a"], "user-a");
    assert.deepEqual(recipients, []);
  });
});
