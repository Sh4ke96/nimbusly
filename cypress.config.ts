import { defineConfig } from "cypress";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { DEV_SITE_URL } from "./lib/constants/dev";
import { registerSupabaseTasks } from "./tests/tasks/supabase";

loadEnv({ path: resolve(__dirname, ".env.local") });

export default defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEV_SITE_URL,
    specPattern: "tests/e2e/**/*.cy.ts",
    supportFile: "tests/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 12_000,
    requestTimeout: 15_000,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      registerSupabaseTasks(on);

      config.env = {
        ...config.env,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSupabaseAdmin: Boolean(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
            process.env.SUPABASE_SERVICE_ROLE_KEY
        ),
      };

      return config;
    },
  },
});
