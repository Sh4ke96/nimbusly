import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Family, FamilyMember, Profile } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";

interface ProfileStore {
  user: User | null;
  profile: Profile | null;
  family: Family | null;
  members: FamilyMember[];
  loaded: boolean;
  loading: boolean;
  fetchSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFamily: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  family: null,
  members: [] as FamilyMember[],
  loaded: false,
  loading: false,
};

async function loadFamilyData(familyId: string) {
  const supabase = createClient();

  const [{ data: family }, { data: members }] = await Promise.all([
    supabase.from("families").select("*").eq("id", familyId).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_color")
      .eq("family_id", familyId),
  ]);

  return { family: family ?? null, members: members ?? [] };
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  ...initialState,

  fetchSession: async () => {
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

    if (profile?.family_id) {
      const familyData = await loadFamilyData(profile.family_id);
      family = familyData.family;
      members = familyData.members;
    }

    set({
      user,
      profile,
      family,
      members,
      loaded: true,
      loading: false,
    });
  },

  refreshProfile: async () => {
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
      set({ family: null, members: [] });
    }
  },

  refreshFamily: async () => {
    const { profile } = get();
    if (!profile?.family_id) {
      set({ family: null, members: [] });
      return;
    }

    const { family, members } = await loadFamilyData(profile.family_id);
    set({ family, members });
  },

  reset: () => set({ ...initialState, loaded: true }),
}));
