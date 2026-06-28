import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NOTIFICATION_TYPE } from "@/lib/constants/notifications";
import { WATCH_TABLE } from "@/lib/constants/watches";
import { notifyEntityWatchers } from "@/lib/server-actions/notify-watchers";

describe("notifyEntityWatchers", () => {
  it("calls watcher RPC with recipients excluding the actor", async () => {
    const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    const supabase = {
      rpc: async (name: string, args: Record<string, unknown>) => {
        rpcCalls.push({ name, args });
        return { error: null };
      },
    };

    await notifyEntityWatchers(
      supabase as never,
      {
        watchTable: WATCH_TABLE.SHOPPING_LIST,
        entityColumn: "list_id",
        entityId: "list-1",
        actorId: "user-b",
        type: NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED,
        title: "Anna dodała pozycję",
        body: "Lista zakupów · mleko",
        payload: {
          shopping_list_id: "list-1",
          item_content: "mleko",
        },
      },
      {
        loadWatcherRecipientIds: async () => ["user-a", "user-b"],
      }
    );

    assert.equal(rpcCalls.length, 1);
    assert.equal(rpcCalls[0]?.name, "create_watcher_notifications");
    assert.equal(rpcCalls[0]?.args.p_watch_kind, "shopping_list");
    assert.equal(rpcCalls[0]?.args.p_entity_id, "list-1");
    assert.deepEqual(rpcCalls[0]?.args.p_recipient_ids, ["user-a"]);
  });

  it("skips RPC when no recipients remain after excluding the actor", async () => {
    let rpcCalled = false;

    const supabase = {
      rpc: async () => {
        rpcCalled = true;
        return { error: null };
      },
    };

    await notifyEntityWatchers(
      supabase as never,
      {
        watchTable: WATCH_TABLE.SHOPPING_LIST,
        entityColumn: "list_id",
        entityId: "list-1",
        actorId: "user-a",
        type: NOTIFICATION_TYPE.SHOPPING_LIST_ITEM_ADDED,
        title: "Test",
        body: "Test",
        payload: { shopping_list_id: "list-1" },
      },
      {
        loadWatcherRecipientIds: async () => ["user-a"],
      }
    );

    assert.equal(rpcCalled, false);
  });
});
