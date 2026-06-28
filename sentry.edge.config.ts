import * as Sentry from "@sentry/nextjs";
import { getSharedSentryInitOptions } from "@/lib/sentry/shared-options";

Sentry.init(getSharedSentryInitOptions());
