"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionFeedbackState = { error: string } | { success: string } | null;

export function useActionFeedback(
  state: ActionFeedbackState,
  onSuccess?: () => void
) {
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;

    const key = "error" in state ? `e:${state.error}` : `s:${state.success}`;
    if (handled.current === key) return;
    handled.current = key;

    if ("error" in state) {
      toast.error(state.error);
      return;
    }

    toast.success(state.success);
    onSuccess?.();
  }, [state, onSuccess]);
}
