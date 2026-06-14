import { ACCOUNT_MODE } from "@/lib/constants/account";
import { INVITATION_STATUS } from "@/lib/constants/family-invitation";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Family, FamilyInvitation, FamilyMember, Profile } from "@/lib/profile";
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
  fetchSession: (force?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  patchDashboardOverviewLayout: (layout: unknown) => void;
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
};

async function loadFamilyData(familyId: string, userId: string, isOwner: boolean) {
  const supabase = createClient();

  const queries = [
    supabase
      .from("families")
      .select("id, name, created_by, invite_code")
      .eq("id", familyId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_color, family_role")
      .eq("family_id", familyId),
  ] as const;

  const [{ data: family }, { data: members }] = await Promise.all(queries);

  let invitations: FamilyInvitation[] = [];
  if (isOwner && family?.created_by === userId) {
    const { data } = await supabase
      .from("family_invitations")
      .select("id, family_id, email, status, created_at, expires_at")
      .eq("family_id", familyId)
      .eq("status", INVITATION_STATUS.PENDING)
      .order("created_at", { ascending: false });
    invitations = (data ?? []) as FamilyInvitation[];
  }

  return { family: family ?? null, members: members ?? [], invitations };
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...initialState,

  fetchSession: async (force = false) => {
    if (!force && get().loaded && !get().loading) return;

    return dedupeAsync("profile:session", async () => {
      set({ loading: true });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ ...initialState, loaded: true, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

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
        profile,
        family,
        members,
        invitations,
        loaded: true,
        loading: false,
      });
    });
  },

  refreshProfile: async () => {
    return dedupeAsync("profile:refresh", async () => {
      const { user } = get();
      if (!user) return;

      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      set({ profile });

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

  reset: () => set({ ...initialState, loaded: true }),
}));
