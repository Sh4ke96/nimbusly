"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionFeedbackState = { error: string } | { success: string } | null;

export function useActionFeedback(
  state: ActionFeedbackState,
  onSuccess?: () => void,
  isPending?: boolean
) {
  const lastHandledState = useRef<ActionFeedbackState>(undefined);

  useEffect(() => {
    if (isPending) {
      lastHandledState.current = undefined;
    }
  }, [isPending]);

  useEffect(() => {
    if (!state) {
      lastHandledState.current = undefined;
      return;
    }

    // Deduplicate per action result object - not by message text, so repeated
    // successes (e.g. adding two medicines) still refresh the UI.
    if (lastHandledState.current === state) return;
    lastHandledState.current = state;

    if ("error" in state) {
      toast.error(state.error);
      return;
    }

    toast.success(state.success);
    onSuccess?.();
  }, [state, onSuccess]);
}
