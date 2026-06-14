import type { AccountActionState } from "@/app/(app)/account/actions";

export function ActionMessage({ state }: { state: AccountActionState }) {
  if (!state) return null;
  if ("error" in state) {
    return (
      <p className="text-sm text-destructive rounded-none bg-destructive/10 px-3 py-2">
        {state.error}
      </p>
    );
  }
  return (
    <p className="text-sm text-primary rounded-none bg-primary/10 px-3 py-2">
      {state.success}
    </p>
  );
}
