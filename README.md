# Nimbusly

**Your family's shared home — all in one place.**

Nimbusly is a family hub web app: shared budget, shopping, gifts, birthdays, schedule, medicine cabinet, watchlist, restaurants, pets, household chores, notes, and family account management. Each member has their own profile; family data stays in sync.

Available in **Polish** and **English**. Current version: **0.3.0** — see `/change-log` or the in-app version badge.

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
| Notes | `/notes` | Custom emoji categories and family visibility |
| Family & settings | `/profile/settings` | Account type, family invites, permissions |

Additional:

- **Nimbus** — in-app companion (bottom-right): guided tours for the app and every module, contextual hints, FAQ, cross-module suggestions, celebrations, quiet mode, tour resume (Esc), and Needs attention awareness
- **Dashboard** (`/dashboard`) — Summary / Modules tabs, customizable overview cards, brown “needs attention” banner
- **Global search** — quick jump to modules, lists, budgets, notes, chores, and more (`Ctrl+K` / `Cmd+K` in the navbar)
- **Notifications** (`/notifications`) — in-app family activity feed
- **Change log** (`/change-log`) — public release history (no login required)
- **Onboarding** — guided setup for new accounts
- **Solo or family mode** — up to 6 members with roles (founder, admin, member)

---

## Tech stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · Radix UI
- Supabase (Auth, PostgreSQL, RLS)
- Zustand (client state) · Server Actions (mutations)
- Recharts · Cypress (E2E) · Node test runner (unit tests)

---

## Prerequisites

- Node.js 20+
- npm
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
   http://localhost:3000/api/auth/callback
   ```

4. Install and start:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

5. Apply database schema (remote Supabase):

```bash
npm run db:push
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
| `SUPABASE_ACCESS_TOKEN` | Optional | Supabase CLI (`db:push`, etc.) |

Never commit `.env.local` or secrets.

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

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (`tests/unit/**/*.test.ts`) |
| `npm run test:types` | Typecheck test tsconfig |
| `npm run e2e` | Cypress headless (starts dev server) |
| `npm run e2e:open` | Cypress interactive |
| `npm run db:push` | Apply SQL migrations to linked Supabase project |
| `npm run db:status` | List migrations |
| `npm run db:link` | Link local CLI to Supabase project |

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

When shipping a release, bump `version` in `package.json` and add an entry to `lib/changelog/entries.ts`.

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
| Tests | `tests/unit/nimbus/*.test.ts` |

See [`.cursor/rules/new-module-or-change.instructions.md`](.cursor/rules/new-module-or-change.instructions.md) for the full checklist.

---

## Testing

**Unit tests**

```bash
npm test
```

Covers domain logic (budget, chores, notes, search, changelog, nimbus, etc.).

**E2E (requires Supabase service role in `.env.local` for full flows)**

```bash
npm run e2e
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

Cypress `baseUrl` uses `NEXT_PUBLIC_SITE_URL` or defaults to `http://localhost:3000`.
