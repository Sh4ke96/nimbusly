import { ACCOUNT_MODE } from "@/lib/constants/account";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { loadFamilyBundle } from "@/lib/family/load-family-bundle";
import type { Family, FamilyInvitation, FamilyMember, Profile } from "@/lib/profile";
import { mapProfileRow } from "@/lib/supabase/row-mappers";
import type { User } from "@supabase/supabase-js";
import { dedupeAsync } from "@/lib/stores/dedupe-async";

interface ProfileStore {
  user: User | null;
  profile: Profile | null;
  family: Family | null;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
  loaded: boolean;
  loading: boolean;
  error: boolean;
  fetchSession: (force?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  patchDashboardOverviewLayout: (layout: unknown) => void;
  patchNimbusCompanionEnabled: (enabled: boolean) => void;
  patchNimbusCompanionQuiet: (quiet: boolean) => void;
  patchQuickAddEnabled: (enabled: boolean) => void;
  patchPushNotificationsEnabled: (enabled: boolean) => void;
  patchEmailDigestEnabled: (enabled: boolean) => void;
  patchNotificationQuietHours: (params: {
    enabled: boolean;
    start: string;
    end: string;
  }) => void;
  patchWeeklyDigestEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  family: null,
  members: [] as FamilyMember[],
  invitations: [] as FamilyInvitation[],
  loaded: false,
  loading: false,
  error: false,
};

async function loadFamilyData(familyId: string, userId: string, isFamilyAccount: boolean) {
  const supabase = createClient();
  return loadFamilyBundle(supabase, familyId, userId, isFamilyAccount);
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...initialState,

  fetchSession: async (force = false) => {
    const state = get();
    if (!force && state.loaded && !state.loading && !state.error) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id === state.user?.id) return;
    }

    return dedupeAsync("profile:session", async () => {
      set({ loading: true, error: false });

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          set({ ...initialState, loaded: true, loading: false, error: true });
          return;
        }

        if (!user) {
          set({ ...initialState, loaded: true, loading: false });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          set({
            user,
            profile: null,
            family: null,
            members: [],
            invitations: [],
            loaded: true,
            loading: false,
            error: true,
          });
          return;
        }

        let family: Family | null = null;
        let members: FamilyMember[] = [];
        let invitations: FamilyInvitation[] = [];

        if (profile?.family_id) {
          const familyData = await loadFamilyData(
            profile.family_id,
            user.id,
            profile.account_mode === ACCOUNT_MODE.FAMILY
          );
          family = familyData.family;
          members = familyData.members;
          invitations = familyData.invitations;
        }

        set({
          user,
          profile: profile ? mapProfileRow(profile) : null,
          family,
          members,
          invitations,
          loaded: true,
          loading: false,
          error: false,
        });
      } catch {
        set({ ...initialState, loaded: true, loading: false, error: true });
      }
    });
  },

  refreshProfile: async () => {
    return dedupeAsync("profile:refresh", async () => {
      const { user } = get();
      if (!user) return;

      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        set({ error: true });
        return;
      }

      set({ profile: profile ? mapProfileRow(profile) : null, error: false });

      if (profile?.family_id) {
        await get().refreshFamily();
      } else {
        set({ family: null, members: [], invitations: [] });
      }
    });
  },

  refreshFamily: async () => {
    return dedupeAsync("profile:family", async () => {
      const { profile, user } = get();
      if (!profile?.family_id || !user) {
        set({ family: null, members: [], invitations: [] });
        return;
      }

      const { family, members, invitations } = await loadFamilyData(
        profile.family_id,
        user.id,
        profile.account_mode === ACCOUNT_MODE.FAMILY
      );
      set({ family, members, invitations });
    });
  },

  patchDashboardOverviewLayout: (layout: unknown) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        dashboard_overview_layout: layout,
      },
    });
  },

  patchNimbusCompanionEnabled: (enabled: boolean) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        nimbus_companion_enabled: enabled,
      },
    });
  },

  patchNimbusCompanionQuiet: (quiet: boolean) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        nimbus_companion_quiet: quiet,
      },
    });
  },

  patchQuickAddEnabled: (enabled: boolean) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        quick_add_enabled: enabled,
      },
    });
  },

  patchPushNotificationsEnabled: (enabled: boolean) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        push_notifications_enabled: enabled,
      },
    });
  },

  patchEmailDigestEnabled: (enabled: boolean) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        email_digest_enabled: enabled,
      },
    });
  },

  patchNotificationQuietHours: ({ enabled, start, end }) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        notification_quiet_hours_enabled: enabled,
        notification_quiet_start: start,
        notification_quiet_end: end,
      },
    });
  },

  patchWeeklyDigestEnabled: (enabled: boolean) => {
    const profile = get().profile;
    if (!profile) return;
    set({
      profile: {
        ...profile,
        weekly_digest_enabled: enabled,
      },
    });
  },

  reset: () => set({ ...initialState }),
}));
