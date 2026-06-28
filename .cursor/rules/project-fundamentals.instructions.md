# Nimbusly — Development Instructions

This document is the single source of truth for coding standards, conventions, and project guidelines for **Nimbusly**.

---

## Prime Directive

**CRITICAL:** This is **Next.js 16** with breaking changes vs older versions. Before writing or changing framework code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices (see also `AGENTS.md`).

**CRITICAL:** Use **`npm`**, not Yarn (`package-lock.json` is the lockfile).

**CRITICAL:** Always use **absolute imports** with the `@/` alias (maps to project root).

**CRITICAL:** Never hardcode user-facing copy — use the **i18n system** (`useT()` / `getServerT()`). Every module must ship **Polish and English** strings in `lib/i18n/pl.ts` and `lib/i18n/en.ts`.

**CRITICAL:** Never use raw string literals for domain values (account mode, roles, tabs, notification types, lang codes). Define them in `lib/constants/` as `as const` objects and derive TypeScript types from them.

**CRITICAL:** Reuse **shadcn/ui** primitives from `components/ui/` — do not reinvent Button, Dialog, Input, etc.

**CRITICAL:** Prefer **minimal, focused diffs** — match existing patterns in the file you edit.

---

## Project Overview

Nimbusly is a **family hub** web app: shared budget, shopping, gifts, birthdays, work schedule, medicine cabinet, watchlist, restaurants, pets, household chores, and family account management. Each family member has their own profile; family data is shared in real time.

- **Languages:** Polish (default) and English
- **Auth & data:** Supabase (Auth + PostgreSQL + RLS)
- **Audience:** Solo users and family accounts (up to 6 members; roles: founder, admin, member)

---

## Repository Details

| | |
|---|---|
| **Type** | Next.js App Router + TypeScript |
| **Framework** | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Radix UI |
| **State** | Zustand (client stores), Server Actions (mutations) |
| **Backend** | Supabase + SQL migrations in `supabase/migrations/` |
| **Package manager** | npm |
| **E2E** | Cypress (`tests/e2e/`) |
| **Unit tests** | Node test runner (`tests/unit/**/*.test.ts`) |

---

## Prerequisites and Environment Setup

### Required

1. **Node.js** 20+ (LTS recommended)
2. **npm**
3. **Supabase project** — URL + anon key in `.env.local` (see `.env.example`)

### Setup

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.

npm install
npm run lint
npm run build
```

For local DB schema work (remote Supabase):

```bash
npm run db:push      # apply migrations
npm run db:status    # list migrations
```

---

## Build and Development Commands

### Development

```bash
npm run dev          # http://localhost:3000
```

### Building and validation

```bash
npm run lint         # ESLint
npm run build        # production build — run before submitting changes
npm run start        # production server
```

### Testing

```bash
npm test             # unit tests (Node test runner)
npm run e2e          # Cypress headless (starts dev server)
npm run e2e:open     # Cypress interactive
npm run cy:run       # Cypress only (server must already run)
```

| Layer | Location |
|-------|----------|
| Unit | `tests/unit/**/*.test.ts` |
| Integration | `tests/integration/**/*.test.ts` |
| Component | `tests/component/**/*.test.tsx` |
| E2E | `tests/e2e/**/*.cy.ts` |
| Cypress config | `cypress.config.ts` — `baseUrl` from `NEXT_PUBLIC_SITE_URL` or `http://localhost:3000` |
| Supabase test tasks | `tests/tasks/supabase` |

---

## Folder Structure

```
app/
├── (auth)/              # login, register, reset-password (public)
├── (app)/               # authenticated app (dashboard, settings, birthdays, …)
│   └── */actions.ts     # Server Actions per feature
├── api/                 # Route handlers (e.g. auth callback)
├── layout.tsx           # root layout
└── globals.css          # design tokens, Tailwind, theme

components/
├── ui/                  # shadcn primitives (Button, Card, Dialog, …)
├── app/                 # shell (header, breadcrumbs)
├── landing/             # marketing pages
├── profile/             # profile bootstrap, settings sections
├── birthdays/           # birthdays module UI
├── notifications/       # notifications UI
└── account/             # account menu, etc.

lib/
├── constants/           # domain enums (ACCOUNT_MODE, FAMILY_ROLE, SETTINGS_TAB, LANG, …)
├── i18n/                # pl.ts, en.ts, types.ts, server.ts, format.ts
├── supabase/            # client, server, middleware helpers
├── stores/              # Zustand (profile, notifications, birthdays, schedule, pets, chores, …)
├── hooks/               # shared React hooks
├── profile/             # domain helpers (settings-tabs, family-roles)
├── family/              # invite codes, email stubs
├── birthdays/           # calendar helpers, types
└── notifications/       # notification types

supabase/migrations/     # numbered SQL migrations (RLS, RPC, tables)

tests/                 # Unit tests (tests/unit/), E2E (tests/e2e/), Cypress support/tasks

.cursor/rules/           # project instructions for AI (this file)
```

### Route groups

- `(auth)` — unauthenticated flows
- `(app)` — requires session; wrapped with `ProfileBootstrap` in `app/(app)/layout.tsx`
- Session / onboarding guards live in `lib/supabase/middleware.ts`, invoked from `proxy.ts`

### Settings tabs

Account settings use query params: `/profile/settings?tab=profile|account|family|permissions|password`.

Helpers: `lib/profile/settings-tabs.ts` (`parseSettingsTab`, `settingsTabHref`, `navigateSettingsTab`).

---

## Development Patterns

### Import patterns (CRITICAL)

Always use `@/` absolute imports:

```ts
// ✅ Correct
import { useT } from "@/lib/lang-context";
import { Button } from "@/components/ui/button";
import { createBirthday } from "@/app/(app)/birthdays/actions";

// ❌ Wrong
import { useT } from "../../../lib/lang-context";
```

### Internationalization (CRITICAL)

- **Client:** `useT()` from `@/lib/lang-context` → `t.section.key`
- **Server:** `getServerT()` / `getServerLang()` from `@/lib/i18n/server`
- **Types:** extend `lib/i18n/types.ts` (`Dict`), then `pl.ts` and `en.ts` **together** — never add a key in only one language
- **Interpolations:** `formatMessage(t.section.template, { key: value })` from `@/lib/i18n/format`
- **Metadata & emails:** use `dict[lang]` / `getServerT()` — no hardcoded titles or inline bilingual email objects in feature code
- **Locales:** `LOCALE_BY_LANG` (`lib/constants/lang.ts`), `getDateFnsLocale()` (`lib/i18n/date-fns-locale.ts`)
- Never ship Polish-only strings in components, Server Actions, or emails
- Never branch on `lang === "pl"` for user-facing copy — both languages live in translation files

### Domain constants & types (CRITICAL)

Domain values belong in `lib/constants/` as `as const` objects with derived types — not raw string literals in components or actions.

| Constant | File |
|----------|------|
| `LANG`, `LANG_COOKIE`, `LOCALE_BY_LANG` | `lib/constants/lang.ts` |
| `ACCOUNT_MODE`, `FAMILY_ROLE`, `FAMILY_SETUP_INTENT` | `lib/constants/account.ts` |
| `SETTINGS_TAB` | `lib/constants/settings.ts` |
| `NOTIFICATION_TYPE` | `lib/constants/notifications.ts` |
| `FAMILY_ACCESS_ERROR` | `lib/constants/server-error.ts` |
| `INVITATION_STATUS` | `lib/constants/family-invitation.ts` |
| `SCHEDULE_ENTRY_TYPE` | `lib/constants/schedule.ts` |
| `TEST_USER_SEED_KIND` | `lib/constants/test.ts` (Cypress seeds) |

```ts
export const ACCOUNT_MODE = { FAMILY: "family", SOLO: "solo" } as const;
export type AccountMode = (typeof ACCOUNT_MODE)[keyof typeof ACCOUNT_MODE];
```

- Compare with `=== ACCOUNT_MODE.FAMILY`, not `=== "family"`
- Hidden form fields, query params, and RPC args use the same constant values
- Internal error codes (e.g. `FAMILY_ACCESS_ERROR.NOT_ADMIN`) map to i18n in the action handler
- Cypress E2E: import domain constants from `tests/support/app-constants.ts` (re-exports `lib/constants/`)

### Server Actions

- Live next to features: `app/(app)/<feature>/actions.ts`
- Return type: `AccountActionState` = `{ error: string } | { success: string } | null`
- Auth: `createClient()` from `@/lib/supabase/server` + `getUser()`
- User feedback: `useActionFeedback(state, onSuccess?)` + Sonner toasts
- Forms: React 19 `useActionState(action, null)`

### Client state (Zustand)

- `lib/stores/profile-store.ts` — user, profile, family, members, invitations
- `lib/stores/notifications-store.ts` — in-app notifications
- Use `dedupeAsync` (`lib/stores/dedupe-async.ts`) to avoid duplicate fetches on refresh
- Bootstrap once via `components/profile/profile-bootstrap.tsx`

### Supabase & database

- **Migrations:** add numbered files in `supabase/migrations/` (e.g. `009_feature.sql`)
- **RLS:** default for all tables; use `security definer` RPCs when cross-user writes are needed
- **Apply:** `npm run db:push` (uses `.env.local`)
- **Clients:** `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (Server Components / Actions)
- Do not bypass RLS from the client for privileged operations — use Server Actions or RPC

### Family domain

- Membership: `profiles.family_id` + `account_mode` (`ACCOUNT_MODE`)
- Roles: `profiles.family_role` (`FAMILY_ROLE`); founder = `families.created_by` (always admin)
- Helpers: `lib/profile/family-roles.ts` (`isFamilyAdmin`, `isFamilyFounder`)
- Role changes: RPC `update_family_member_role` via `family-permissions-actions.ts`

---

## Component Development

### General rules

- **Client components:** add `"use client"` only when needed (hooks, events, browser APIs)
- **UI primitives:** `components/ui/*` (shadcn) — extend via `className` + `cn()` from `@/lib/utils`
- **Icons:** `lucide-react`
- **Feedback:** `sonner` toasts via `useActionFeedback` or direct `toast.*`
- **Loading:** `Skeleton` from `components/ui/skeleton` for route-level placeholders

### Visual language

- **Corners:** `rounded-none` everywhere (brand style — no border radius)
- **Fonts:** Nunito (body), Quicksand (headings) — CSS variables in `globals.css`
- **Colors:** semantic tokens (`primary`, `muted`, `destructive`, …) — never hardcode hex in components
- **Layout:** `AppHeader`, `AccountBreadcrumbs`, `Card` + `max-w-7xl` content width on app pages

### Feature components

Group by domain under `components/<feature>/`:

```
components/birthdays/
├── birthdays-view.tsx       # page-level composition
├── birthday-calendar.tsx
├── birthday-form-dialog.tsx
└── birthday-entry-form.tsx  # shared form fields
```

- Page files in `app/(app)/<route>/page.tsx` stay thin — delegate to view components
- Co-locate small helpers in `lib/<feature>/`, not inside UI files

### Forms

- shadcn `Input`, `Label`, `Button`
- Server Action as `form action={action}`
- Hidden fields for IDs; validate on server (never trust client alone)
- Disable submit while `pending` from `useActionState`

---

## Styling Guidelines

- **Tailwind CSS v4** — utility classes in TSX
- **Global theme:** `app/globals.css` (`:root` / `.dark` CSS variables, `@theme inline`)
- **Merge classes:** `cn()` from `lib/utils` (clsx + tailwind-merge)
- **No CSS modules / SCSS** in this project
- **No px-vs-em mandate** — use Tailwind spacing scale (`p-4`, `gap-6`, `text-sm`)
- Third-party overrides (e.g. `react-day-picker`) go in `globals.css` using `var(--primary)`

---

## Code Quality Requirements

| Check | Requirement |
|-------|-------------|
| ESLint | `npm run lint` must pass |
| TypeScript | `strict: true` — `npx tsc --noEmit` clean |
| i18n | New UI strings in `types.ts` + `pl.ts` + `en.ts` |
| Scope | Smallest correct change; no drive-by refactors |
| Secrets | Never commit `.env.local` or service role keys |

### Style conventions (observed in repo)

- 2-space indentation in TS/TSX
- Double quotes in TS (single in some legacy middleware files — match the file)
- Named exports for components; default export OK for `page.tsx` / `layout.tsx`
- Types near usage or in `lib/<domain>/types.ts`
- **`useState`:** always pass an explicit type argument — e.g. `useState<boolean>(false)`, `useState<string>("")`, `useState<Date | undefined>()`, `useState<Item[]>([])`. With lazy init: `useState<string>(() => readValue())`

---

## Validation Before Commit

```bash
npm run lint
npm run build
npm test
# optional:
npm run e2e          # needs .env.local + Supabase admin for full suite
```

For **any shipped change** (feature, fix, infra users care about — PWA, push, analytics, env vars, etc.), update in the **same PR / same commit batch**:

- `lib/changelog/entries.ts` — **new entry at the top**, PL + EN `title` and `changes`
- `package.json` — `version` must equal the top changelog entry
- `README.md` — current version; features, env vars, or testing notes when relevant
- Unit / E2E tests when behaviour changes

**Do not** merge or hand off work without a changelog entry when the product behaviour changed. Internal-only refactors with zero user impact may skip a version bump — when in doubt, add an entry.

Only create git commits when explicitly requested.

---

## Related Instructions

- **New module or change:** [`new-module-or-change.instructions.md`](new-module-or-change.instructions.md) — shadcn, Zustand, Tailwind, tests, error handling, Supabase safety checklist

---

## Summary of Critical Rules

1. Read **Next.js 16 docs** in `node_modules/next/dist/docs/` before framework changes
2. Use **`npm`**, not Yarn
3. Use **`@/`** absolute imports only
4. Use **`useT()` / `getServerT()`** — no hardcoded user-facing text
5. Reuse **`components/ui/`** shadcn primitives
6. Mutations via **Server Actions** + Supabase server client
7. Client session/family state via **Zustand** + **ProfileBootstrap**
8. Schema changes via **`supabase/migrations/`** + `npm run db:push`
9. Visual style: **`rounded-none`**, theme tokens, Tailwind utilities
10. Validate with **`npm run lint`**, **`npm run build`**, and **`npm test`**
11. **Changelog always** (when behaviour changes): `lib/changelog/entries.ts` (top entry, PL + EN), matching **`package.json` version**, **`README.md`**, tests — same change
12. Keep diffs **minimal** and consistent with surrounding code
