import { useProfileStore } from "@/lib/stores/profile-store";

/** Profile opt-out for Ctrl+K quick add and mobile FAB (default: enabled). */
export function useQuickAddEnabled(): boolean {
  const profile = useProfileStore((s) => s.profile);
  return profile?.quick_add_enabled !== false;
}
