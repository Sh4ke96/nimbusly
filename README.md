# Nimbusly

**Your family's shared home — all in one place.**

Nimbusly is a family hub web app: shared budget, shopping, gifts, birthdays, schedule, medicine cabinet, watchlist, restaurants, pets, household chores, notes, and family account management. Each member has their own profile; family data stays in sync.

Available in **Polish** and **English**. Current version: **0.7.0** — see `/change-log` or the in-app version badge.

---

## Features

| Module | Route | Description |
|--------|-------|-------------|
| Budget | `/budget` | Shared budgets, income & expenses, recurring entries, hidden budgets, payment reminders |
| Shopping lists | `/shopping` | Shared lists with live updates and optional watches |
| Gifts | `/gifts` | Gift ideas per recipient without spoiling surprises |
| Birthdays | `/birthdays` | Calendar, upcoming birthdays, reminders |
| Schedule | `/schedule` | Shared work / family schedule with multi-day date ranges |
| Medicine cabinet | `/medicine-cabinet` | Home pharmacy with expiry tracking |
| Watchlist | `/watchlist` | Movies & series to watch together |
| Restaurants | `/restaurants` | Places to visit and ratings |
| Pets | `/pets` | Pet profiles and care schedules |
| Chores | `/chores` | Household tasks with assignees and recurrence |
| Notes | `/notes` | Custom emoji categories, Markdown, pinning, attachments, family visibility |
| Family | `/family` | Members, invitations, account type (solo ↔ family) |
| Settings | `/profile/settings` | Profile, notifications, account type, shopping categories |

Additional:

- **Mobile-first layout** — bottom navigation, larger touch targets, safe-area insets, module grid via `?view=modules`
- **PWA** — web manifest, service worker, offline fallback, install prompt, **Web Push** (iOS 16.4+ / Android)
- **Vercel Analytics & Speed Insights** — traffic and Core Web Vitals in the Vercel project dashboard (production)
- **Sentry** — error monitoring for client, server, API routes, and crons (optional; see env vars)
- **Nimbus** — in-app companion (bottom-right): guided tours (driver.js) for the app and every module, contextual hints, FAQ, cross-module suggestions, celebrations, quiet mode, tour resume (Esc), keyboard shortcuts (A/D, arrows), and Needs attention awareness
- **Dashboard** (`/dashboard`) — Summary / Modules tabs, customizable overview cards, brown “needs attention” banner
- **Global search** — quick jump to modules, lists, budgets, notes, chores, and more (`Ctrl+K` / `Cmd+K` in the navbar)
- **Notifications** (`/notifications`) — in-app family activity feed, quiet hours, optional weekly digest
- **Change log** (`/change-log`) — public release history (no login required)
- **Onboarding** — guided setup for new accounts
- **Solo or family mode** — up to 6 members with roles (founder, admin, member)

---

## Tech stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · Radix UI
- Supabase (Auth, PostgreSQL, RLS)
- Zustand (client state) · Server Actions (mutations)
- Recharts · driver.js (Nimbus tours) · Cypress (E2E) · Node test runner (unit tests)

---

## Prerequisites

- Node.js 20+
- yarn
- A [Supabase](https://supabase.com) project

---

## Running locally

1. Copy environment file:

```bash
cp .env.example .env.local
```

2. Set at minimum in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. In Supabase Dashboard → **Authentication** → **URL Configuration**, add:

   ```
   http://localhost:7777/api/auth/callback
   ```

4. Install and start:

```bash
yarn install
yarn dev
```

Open [http://localhost:7777](http://localhost:7777).

5. Apply database schema (remote Supabase):

```bash
yarn db:push
```

---

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Yes | App origin (auth redirects, emails, Cypress) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | E2E tests, cron reminders, admin tasks |
| `RESEND_API_KEY` | Optional | Family invite & reminder emails |
| `RESEND_FROM_EMAIL` | Optional | Sender address for Resend |
| `CRON_SECRET` | Optional | Protects cron API routes |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Web Push — client subscription (`yarn push:vapid`) |
| `VAPID_PRIVATE_KEY` | Optional | Web Push — server send (never expose to client) |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry error monitoring (client + server) |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry source maps upload on Vercel build |
| `SENTRY_ORG` | Optional | Sentry organization slug (with auth token) |
| `SENTRY_PROJECT` | Optional | Sentry project slug (with auth token) |
| `SUPABASE_ACCESS_TOKEN` | Optional | Supabase CLI (`db:push`, etc.) |

Never commit `.env.local` or secrets.

---

## Web Push (optional)

When `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are set (generate with `yarn push:vapid`):

1. Deploy a **production** build over **HTTPS**
2. User installs the PWA (Android prompt or iOS home screen)
3. User enables push in **Profile → Settings** or via the in-app prompt
4. Family in-app notifications and budget reminders also trigger push

**iOS:** requires iOS 16.4+, Safari, app added to home screen — no push in the browser tab.

---

## Sentry (optional)

1. Create a free project at [sentry.io](https://sentry.io) (platform: **Next.js**).
2. Copy the **DSN** into `NEXT_PUBLIC_SENTRY_DSN` on Vercel and in `.env.local`.
3. (Recommended) Create an **Auth Token** with `project:releases` and set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` on Vercel for readable stack traces.
4. Deploy — errors from the browser, Server Actions, `/api/*`, and crons appear in Sentry.

Without a DSN the SDK stays disabled; local `yarn dev` works unchanged.

---

## Email reminders (optional)

When `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` are set, schedule cron jobs:

**Family digest** (chores, medicine, pets, birthdays):

```http
GET /api/cron/reminders
Authorization: Bearer <CRON_SECRET>
```

**Budget payment due reminders** (7 / 3 / 0 days before due date):

```http
GET /api/cron/budget-payment-reminders
Authorization: Bearer <CRON_SECRET>
```

**Weekly digest** (Monday 08:00 UTC — summary of unread notifications when enabled in profile settings):

```http
GET /api/cron/weekly-digest
Authorization: Bearer <CRON_SECRET>
```

On Vercel, `vercel.json` schedules `/api/cron/weekly-digest` automatically when deployed.

---

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Development server |
| `yarn build` | Production build |
| `yarn start` | Production server |
| `yarn validate` | **Full validation** — lint, `test:types`, unit tests, production build |
| `yarn run check` | Alias for `yarn validate` (use `run` — Yarn 1 reserves bare `yarn check`) |
| `yarn verify` | Alias for `yarn validate` |
| `yarn lint` | ESLint only |
| `yarn test` | Unit tests (`tests/unit/**/*.test.ts`) |
| `yarn test:types` | Typecheck test tsconfig |
| `yarn e2e` | Cypress headless (starts dev server) |
| `yarn e2e:open` | Cypress interactive |
| `yarn db:push` | Apply SQL migrations to linked Supabase project |
| `yarn db:status` | List migrations |
| `yarn db:link` | Link local CLI to Supabase project |

---

## Project layout

```
app/              Next.js App Router (auth, app routes, API, Server Actions)
components/       UI (shadcn, feature views, layout, nimbus companion)
lib/              Domain logic, stores, i18n, Supabase helpers, nimbus/
supabase/         SQL migrations
tests/            Unit tests (`tests/unit/`) and E2E (`tests/e2e/`)
```

Developer guidelines: [`AGENTS.md`](AGENTS.md) and [`.cursor/rules/`](.cursor/rules/).

### Shipping a release (mandatory)

When you ship a **user-visible** feature, fix, or module:

1. Prepend an entry to `lib/changelog/entries.ts` (PL + EN `title` and `changes`).
2. Bump `version` in `package.json` to match that entry.
3. Update **`README.md`** — current version, feature list, env vars, or testing notes if they changed.
4. Add or update **tests** (`tests/unit/`, `tests/e2e/`) for new behaviour; run **`yarn validate`**.

### Nimbus companion (`lib/nimbus/`, `components/nimbus/`)

When you **add a module**, **change user-facing flows**, or **rename routes/UI targets**, update Nimbus in the same PR:

| Area | Files |
|------|--------|
| Module tour steps | `lib/nimbus/tour-catalog.ts`, `lib/constants/nimbus-tour.ts`, `data-nimbus-tour` on views |
| Tour copy (PL + EN) | `lib/i18n/nimbus-messages.ts`, `lib/i18n/nimbus-tour-summaries.ts` |
| Context hints | `lib/nimbus/context-hints.ts`, `companion.context` in `nimbus-messages.ts` |
| FAQ | `lib/nimbus/faq.ts`, `companion.faq` in `nimbus-messages.ts` |
| Suggestions | `lib/nimbus/suggestions.ts`, `suggestion-links.ts`, `companion.suggestions` |
| Celebrations | `lib/nimbus/celebrations.ts`, form hooks via `useNimbusCelebration` |
| Driver tour engine | `lib/nimbus/build-driver-steps.ts`, `driver-tour-popover.ts`, `components/nimbus/nimbus-driver-tour.tsx` |
| Tests | `tests/unit/nimbus/*.test.ts` |

See [`.cursor/rules/new-module-or-change.instructions.md`](.cursor/rules/new-module-or-change.instructions.md) for the full checklist.

---

## Testing

**Full validation (run before push)**

```bash
yarn validate
```

Runs ESLint, test TypeScript check, unit tests, and production build. (`yarn run check` is an alias; bare `yarn check` in Yarn 1 is a different lockfile command.)

**Unit tests only**

```bash
yarn test
```

Covers domain logic (budget, chores, notes, search, changelog, nimbus driver steps, etc.).

**E2E (requires Supabase service role in `.env.local` for full flows)**

```bash
yarn e2e
```

| Spec | Scope |
|------|--------|
| `01-landing` | Landing page sections and auth links |
| `02-auth` · `03-guards` | Login, register, route protection |
| `04-onboarding` | Profile setup |
| `05-dashboard` | Greeting, modules tab, account menu |
| `06-settings-logout` | Settings and sign-out |
| `07-family-invites` | Family invites |
| `08-gifts` · `09-shopping-realtime` | Module flows |
| `10-cron` | Cron auth |
| `11-change-log` | Public change log |
| `11-modules-smoke` | All module pages load |
| `22-mobile-nav` | Mobile bottom nav and `?view=modules` |
| `23-offline` | Offline fallback page |
| `24-pwa-install` | PWA install prompt (`beforeinstallprompt`) |
| `25-pwa-push` | Push setting in profile settings |

Cypress `baseUrl` uses `NEXT_PUBLIC_SITE_URL` or defaults to `http://localhost:7777`.
