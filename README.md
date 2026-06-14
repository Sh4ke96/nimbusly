# Nimbusly

**Your family's shared home — all in one place.**

Nimbusly is a family hub web app: shared budget, shopping, gifts, birthdays, schedule, medicine cabinet, watchlist, restaurants, pets, household chores, and family account management. Each member has their own profile; family data stays in sync.

Available in **Polish** and **English**.

---

## Features

| Module | Route | Description |
|--------|-------|-------------|
| Budget | `/budget` | Shared budgets, income & expenses, monthly overview |
| Shopping lists | `/shopping` | Shared lists with live updates and optional watches |
| Gifts | `/gifts` | Gift ideas per recipient without spoiling surprises |
| Birthdays | `/birthdays` | Calendar, upcoming birthdays, reminders |
| Schedule | `/schedule` | Shared work / family schedule |
| Medicine cabinet | `/medicine-cabinet` | Home pharmacy with expiry tracking |
| Watchlist | `/watchlist` | Movies & series to watch together |
| Restaurants | `/restaurants` | Places to visit and ratings |
| Pets | `/pets` | Pet profiles and care schedules |
| Chores | `/chores` | Household tasks with assignees and recurrence |
| Family & settings | `/profile/settings` | Account type, family invites, permissions |

Additional:

- **Dashboard** (`/dashboard`) — customizable overview cards and an “needs attention” summary
- **Notifications** (`/notifications`) — in-app family activity feed
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
| `CRON_SECRET` | Optional | Protects `GET /api/cron/reminders` |
| `SUPABASE_ACCESS_TOKEN` | Optional | Supabase CLI (`db:push`, etc.) |

Never commit `.env.local` or secrets.

---

## Email reminders (optional)

When `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` are set, schedule a cron job:

```http
GET /api/cron/reminders
Authorization: Bearer <CRON_SECRET>
```

The endpoint sends digest emails for overdue chores, expiring medicine, due pet care, and upcoming birthdays.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (`tests/unit/**/*.test.ts`) |
| `npm run e2e` | Cypress headless (starts dev server) |
| `npm run e2e:open` | Cypress interactive |
| `npm run db:push` | Apply SQL migrations to linked Supabase project |
| `npm run db:status` | List migrations |
| `npm run db:link` | Link local CLI to Supabase project |

---

## Project layout

```
app/              Next.js App Router (auth, app routes, API, Server Actions)
components/       UI (shadcn, feature views, layout)
lib/              Domain logic, stores, i18n, Supabase helpers
supabase/         SQL migrations
tests/            Unit tests (`tests/unit/`) and E2E (`tests/e2e/`)
```

Developer guidelines: [`AGENTS.md`](AGENTS.md) and [`.cursor/rules/`](.cursor/rules/).

---

## Testing

**Unit tests**

```bash
npm test
```

**E2E (requires Supabase service role in `.env.local` for full flows)**

```bash
npm run e2e
```

Cypress `baseUrl` uses `NEXT_PUBLIC_SITE_URL` or defaults to `http://localhost:3000`.
