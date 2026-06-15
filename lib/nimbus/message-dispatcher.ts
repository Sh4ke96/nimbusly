import { NIMBUS_CALLING_LEAD_MS } from "@/lib/constants/nimbus";
import {
  useNimbusStore,
  type NimbusHintAction,
  type NimbusHintKind,
} from "@/lib/stores/nimbus-store";
import { isNimbusHintsSnoozed } from "@/lib/nimbus/snooze";

export const NIMBUS_MESSAGE_PRIORITY = {
  celebration: 100,
  attention: 90,
  changelog: 85,
  greeting: 80,
  context: 60,
  suggestion: 50,
  random: 30,
  joke: 20,
} as const;

export interface NimbusQueuedMessage {
  id: string;
  priority: number;
  readyAt: number;
  kind: NimbusHintKind;
  message?: string;
  hintIndex?: number;
  action?: NimbusHintAction;
  useCallingAnimation?: boolean;
  onConsumed?: () => void;
}

let queue: NimbusQueuedMessage[] = [];
let dispatchTimer: number | undefined;
let initialized = false;

function canDispatch(): boolean {
  const state = useNimbusStore.getState();
  if (state.tourActive || state.menuOpen) return false;
  if (state.hintMessage !== null || state.hintIndex !== null) return false;
  if (isNimbusHintsSnoozed()) return false;
  return true;
}

function sortQueue() {
  queue.sort((a, b) => b.priority - a.priority || a.readyAt - b.readyAt);
}

function scheduleProcess() {
  if (dispatchTimer !== undefined) {
    window.clearTimeout(dispatchTimer);
    dispatchTimer = undefined;
  }
  if (queue.length === 0) return;

  const now = Date.now();
  const nextReady = queue.find((entry) => entry.readyAt <= now);
  if (nextReady && canDispatch()) {
    dispatchTimer = window.setTimeout(() => {
      dispatchTimer = undefined;
      processQueue();
    }, 0);
    return;
  }

  const next = queue[0];
  if (!next) return;
  const wait = Math.max(0, next.readyAt - Date.now());
  dispatchTimer = window.setTimeout(() => {
    dispatchTimer = undefined;
    processQueue();
  }, wait);
}

function processQueue() {
  if (!canDispatch()) {
    scheduleProcess();
    return;
  }

  const now = Date.now();
  const index = queue.findIndex((entry) => entry.readyAt <= now);
  if (index === -1) {
    scheduleProcess();
    return;
  }

  const [entry] = queue.splice(index, 1);
  entry.onConsumed?.();

  const store = useNimbusStore.getState();
  if (entry.hintIndex !== undefined) {
    if (entry.useCallingAnimation !== false) {
      store.announceHint(entry.hintIndex);
    } else {
      store.showHint(entry.hintIndex);
    }
    return;
  }

  if (!entry.message) {
    scheduleProcess();
    return;
  }

  if (entry.useCallingAnimation !== false) {
    store.announceCustomHint(entry.message, entry.kind, entry.action);
  } else {
    store.showCustomHint(entry.message, entry.kind, entry.action);
  }
}

export function initNimbusMessageDispatcher() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  useNimbusStore.subscribe((state, prev) => {
    const hintCleared =
      (prev.hintMessage !== null || prev.hintIndex !== null) &&
      state.hintMessage === null &&
      state.hintIndex === null;
    if (hintCleared) {
      scheduleProcess();
    }
  });
}

export function clearNimbusMessageQueue() {
  queue = [];
  if (dispatchTimer !== undefined) {
    window.clearTimeout(dispatchTimer);
    dispatchTimer = undefined;
  }
}

export function enqueueNimbusMessage(
  entry: Omit<NimbusQueuedMessage, "id" | "readyAt"> & {
    id?: string;
    delayMs?: number;
  }
) {
  if (typeof window === "undefined") return;

  const item: NimbusQueuedMessage = {
    id: entry.id ?? `${entry.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    priority: entry.priority,
    readyAt: Date.now() + (entry.delayMs ?? 0),
    kind: entry.kind,
    message: entry.message,
    hintIndex: entry.hintIndex,
    action: entry.action,
    useCallingAnimation: entry.useCallingAnimation,
    onConsumed: entry.onConsumed,
  };

  const existingIndex = item.id ? queue.findIndex((queued) => queued.id === item.id) : -1;
  if (existingIndex >= 0) {
    queue[existingIndex] = item;
  } else {
    queue.push(item);
  }

  sortQueue();
  scheduleProcess();
}

export function enqueueNimbusAttentionHint(
  message: string,
  action: NimbusHintAction,
  options?: { delayMs?: number; onConsumed?: () => void }
) {
  enqueueNimbusMessage({
    id: "attention-daily",
    priority: NIMBUS_MESSAGE_PRIORITY.attention,
    kind: "attention",
    message,
    action,
    delayMs: options?.delayMs ?? 0,
    onConsumed: options?.onConsumed,
    useCallingAnimation: true,
  });
}

export { NIMBUS_CALLING_LEAD_MS };
