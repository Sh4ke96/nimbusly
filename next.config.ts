import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

const sentryBuildOptions = {
  org: sentryOrg,
  project: sentryProject,
  authToken: sentryAuthToken,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
} as const;

export default process.env.NODE_ENV === "production"
  ? withSentryConfig(nextConfig, sentryBuildOptions)
  : nextConfig;
