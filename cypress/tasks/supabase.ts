import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

export type TestUserSeed =
  | { kind: "pending" }
  | {
      kind: "onboarded";
      accountMode: "family" | "solo";
      firstName?: string;
      lastName?: string;
      familyName?: string;
    };

export type CreatedTestUser = {
  email: string;
  password: string;
  userId: string;
};

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function hasAdminAccess() {
  return Boolean(getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnonClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Brak NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY — ustaw je w .env.local."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function randomEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function createAuthUserViaAdmin(
  admin: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Nie udało się utworzyć użytkownika (admin): ${error?.message}`);
  }

  return data.user;
}

async function createAuthUserViaSignUp(
  anon: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await anon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/callback`,
    },
  });

  if (error || !data.user) {
    throw new Error(`Nie udało się zarejestrować użytkownika: ${error?.message}`);
  }

  return data.user;
}

async function seedProfile(
  admin: SupabaseClient,
  userId: string,
  seed: Extract<TestUserSeed, { kind: "onboarded" }>
) {
  const firstName = seed.firstName ?? "Anna";
  const lastName = seed.lastName ?? "Testowa";
  const accountMode = seed.accountMode;
  let familyId: string | null = null;

  if (accountMode === "family") {
    const familyName = seed.familyName ?? "Rodzina Testowa";
    const { data: family, error: familyError } = await admin
      .from("families")
      .insert({ name: familyName, created_by: userId })
      .select("id, invite_code")
      .single();

    if (familyError || !family) {
      throw new Error(`Nie udało się utworzyć rodziny testowej: ${familyError?.message}`);
    }

    familyId = family.id;
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    first_name: firstName,
    last_name: lastName,
    avatar_color: "#618764",
    family_id: familyId,
    account_mode: accountMode,
    onboarding_completed: true,
  });

  if (profileError) {
    throw new Error(`Nie udało się utworzyć profilu testowego: ${profileError.message}`);
  }
}

export function registerSupabaseTasks(on: Cypress.PluginEvents) {
  on("task", {
    hasSupabaseAdmin() {
      return hasAdminAccess();
    },

    async createTestUser({
      prefix = "e2e",
      password = "TestPassword123!",
      seed = { kind: "pending" } as TestUserSeed,
    }: {
      prefix?: string;
      password?: string;
      seed?: TestUserSeed;
    }): Promise<CreatedTestUser> {
      const email = randomEmail(prefix);

      if (seed.kind === "onboarded" && !hasAdminAccess()) {
        throw new Error(
          "Seed onboarded wymaga SUPABASE_SERVICE_ROLE_KEY — użyj cy.setupOnboardedFamilyUser() / cy.setupOnboardedSoloUser()."
        );
      }

      if (hasAdminAccess()) {
        const admin = getAdminClient();
        const user = await createAuthUserViaAdmin(admin, email, password);

        if (seed.kind === "onboarded") {
          await seedProfile(admin, user.id, seed);
        }

        return { email, password, userId: user.id };
      }

      const anon = getAnonClient();
      const user = await createAuthUserViaSignUp(anon, email, password);
      return { email, password, userId: user.id };
    },

    async deleteTestUser({ userId }: { userId: string }) {
      if (!hasAdminAccess()) {
        return null;
      }

      const admin = getAdminClient();
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) {
        throw new Error(`Nie udało się usunąć użytkownika testowego: ${error.message}`);
      }
      return null;
    },

    async getFamilyInviteCode({ userId }: { userId: string }): Promise<string> {
      const admin = getAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("family_id")
        .eq("id", userId)
        .maybeSingle();

      if (!profile?.family_id) {
        throw new Error("Użytkownik nie należy do rodziny");
      }

      const { data: family, error } = await admin
        .from("families")
        .select("invite_code")
        .eq("id", profile.family_id)
        .single();

      if (error || !family?.invite_code) {
        throw new Error("Nie udało się pobrać kodu zaproszenia");
      }

      return family.invite_code as string;
    },
  });
}
