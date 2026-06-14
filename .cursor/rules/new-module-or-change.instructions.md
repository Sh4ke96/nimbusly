# New Module or Change — Instructions

Use this checklist for **every new feature module** or **non-trivial change** in Nimbusly.

See also: [`project-fundamentals.instructions.md`](project-fundamentals.instructions.md)

---

## Before You Code

1. Read existing code in the same domain (`components/<feature>/`, `lib/<feature>/`, `app/(app)/<feature>/`).
2. Check `components/ui/` for shadcn primitives you can reuse.
3. Check `lib/stores/` for existing Zustand stores — extend before creating a new one.
4. If the feature touches the DB, plan a migration in `supabase/migrations/`.

---

## UI & Styling (mandatory)

### shadcn / existing components

- **Always** build UI from `components/ui/*` (Button, Card, Dialog, Input, Tabs, Skeleton, …).
- **Reuse** feature components already in the repo (e.g. `AppHeader`, `AccountBreadcrumbs`, `MemberAvatar`, `SettingsFormFooter`).
- Add a new shadcn component only when nothing existing fits — install via shadcn CLI, keep in `components/ui/`.
- **Do not** create parallel Button/Modal/Input implementations.

### Tailwind only

- Style with **Tailwind utility classes** in TSX.
- Merge classes with `cn()` from `@/lib/utils`.
- Use theme tokens (`bg-primary`, `text-muted-foreground`, `border-border`) — no random hex colors.
- Keep brand style: **`rounded-none`**, fonts from `globals.css`.
- Global overrides for third-party widgets go in `app/globals.css`, not inline hacks.

### i18n (mandatory)

- All user-visible strings via `useT()` (client) or `getServerT()` (server).
- Add keys to `lib/i18n/types.ts`, `pl.ts`, and `en.ts` **in the same change**.
- Use `formatMessage()` for `{placeholder}` templates — no string concatenation for copy.
- Emails, metadata, calendar month names, and role labels → translation files, not inline PL/EN objects.
- Both **Polish and English** are required for every new module.

### Domain constants (mandatory)

- New domain values (statuses, types, tabs, roles) → `lib/constants/<domain>.ts` with `as const` + exported type.
- Import constants in components, stores, and Server Actions — no magic strings.
- If a value is stored in the DB, the constant string must match the column/check constraint.

### React local state

- Every `useState` must declare an explicit type: `useState<boolean>(false)`, `useState<string>("")`, `useState<Date | undefined>()`, etc.
- Lazy init: `useState<string>(() => readFromCookie())`
- Shared / cached data across routes → Zustand in `lib/stores/`, not prop drilling or duplicate fetches

---

## Client State (mandatory)

### Zustand

- **Always** use Zustand for shared client state (lists, loading flags, cached entities).
- New module with client-side data → add or extend a store in `lib/stores/`.
- Follow existing patterns:
  - `loaded` / `loading` flags
  - `fetchX(force?: boolean)` with early return when already loaded
  - `dedupeAsync()` from `lib/stores/dedupe-async.ts` for in-flight request deduplication
  - `reset()` when user logs out (wire from `profile-store` if needed)
- Selectors: `useStore((s) => s.field)` — avoid subscribing to the whole store.
- Bootstrap session-level data once (see `ProfileBootstrap`) — do not refetch profile on every mount.

### Example layout for a new module

```
lib/stores/shopping-store.ts      # Zustand store
lib/shopping/types.ts             # domain types + validators
lib/shopping/helpers.ts            # pure functions (testable)
components/shopping/shopping-view.tsx
app/(app)/shopping/page.tsx       # thin page
app/(app)/shopping/actions.ts     # Server Actions
```

---

## Server Logic & Data

### Server Actions (default for mutations)

Place in `app/(app)/<feature>/actions.ts`.

Return type (consistent with the rest of the app):

```ts
export type ActionState = { error: string } | { success: string } | null;
```

Wire UI with `useActionState` + `useActionFeedback` + Sonner toasts.

### Route Handlers (only when needed)

Use `app/api/**/route.ts` for webhooks, OAuth callbacks, or non-form HTTP entry points.

Map HTTP semantics explicitly:

| Situation | Status |
|-----------|--------|
| Invalid input / malformed body | `400` |
| Missing or invalid auth | `401` |
| Authenticated but not allowed | `403` |
| Entity does not exist | `404` |
| Conflict (duplicate, wrong state) | `409` |
| Unexpected server/DB failure | `500` |

```ts
return NextResponse.json({ error: "..." }, { status: 400 });
```

Server Actions do not use HTTP status codes — return `{ error: t.... }` with a **specific, translated** message that matches the situation (unauthorized, not found, validation, generic).

---

## Error Handling Checklist

### try/catch

- Wrap **non-critical side effects** (e.g. sending notifications) in `try/catch` so the main operation still succeeds.
- For **critical paths** (DB write, payment, etc.): check `error` from Supabase; do not swallow failures silently.
- Never expose raw DB/PostgREST messages to users — map to i18n keys.

### Input validation (≈ HTTP 400)

Validate **on the server** before any write:

- Required fields present and trimmed
- Types and ranges (dates, enums, string length)
- Domain rules (`isValidBirthDate`, invite code format, etc.)

```ts
if (!personName) return { error: t.birthdays.errorPersonName };
if (!isValidBirthDate(month, day)) return { error: t.birthdays.errorInvalidDate };
```

Client-side `required` / `maxLength` is UX only — server validation is mandatory.

### Existence & authorization (≈ HTTP 404 / 403)

Before update/delete:

1. Load the row with `.eq("id", id).maybeSingle()`
2. If missing → return not-found error (translated)
3. If present but wrong owner/family/role → return forbidden error (translated)

```ts
const { data: existing } = await supabase
  .from("birthday_entries")
  .select("id, created_by")
  .eq("id", id)
  .eq("created_by", user.id)
  .maybeSingle();

if (!existing) return { error: t.birthdays.errorNotOwner };
```

Prefer **RLS** as the last line of defense; Server Actions must still validate intent and return clear errors.

### Supabase / PostgREST error handling (not Prisma)

This project uses **Supabase**, not Prisma. Handle:

| Code / case | Meaning | Action |
|-------------|---------|--------|
| `error` truthy on insert/update/delete | RLS denial, constraint, network | Map to `t.*.errorGeneric` or specific i18n |
| `PGRST116` / empty `.maybeSingle()` | Not found | Return not-found message |
| `23505` | Unique violation | Return “already exists” style message |
| `23503` | Foreign key violation | Return generic or domain-specific error |
| RPC `raise exception` | Business rule failed | Match message or use generic error |

```ts
const { data, error } = await supabase.from("...").insert(...).select("id").single();

if (error) {
  if (error.code === "23505") return { error: t.account.familyInviteAlreadyPending };
  return { error: t.account.errorGeneric };
}
```

### No SQL injection

- **Never** concatenate user input into SQL strings.
- Use Supabase client `.from().select().eq()` or parameterized `.rpc("name", { p_id: id })`.
- Migrations and RPC bodies live in `supabase/migrations/` — review any dynamic SQL there.
- Do not use `supabase.rpc` with raw SQL built from form data.

### No hardcoded secrets

- API keys, service role, Resend keys → `process.env.*` only (`.env.local`, never committed).
- Never log secrets or full tokens.
- Client code uses **anon key** only; privileged operations stay in Server Actions / RPC / Cypress tasks.

---

## Database & Migrations

When adding tables, columns, or policies:

1. Create `supabase/migrations/00N_description.sql`
2. Enable RLS on new tables
3. Add policies for select/insert/update/delete aligned with family/solo model
4. Use `security definer` RPCs only when RLS cannot express the rule safely
5. Run `npm run db:push`
6. Update TypeScript types in `lib/<domain>/types.ts`

---

## Tests (mandatory)

### Always write or update tests

| Change type | Required tests |
|-------------|----------------|
| New pure helpers (`lib/**/helpers.ts`, validators, formatters) | `lib/**/*.test.ts` (Node test runner) |
| New user flow (auth, onboarding, settings, invites) | Cypress spec in `cypress/e2e/` or extend existing |
| Bug fix | Regression test when feasible |

### Commands

```bash
npm test              # unit tests
npm run e2e           # full E2E (dev server + Cypress)
```

### Unit test pattern

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { myHelper } from "./my-helper";

describe("myHelper", () => {
  it("does the expected thing", () => {
    assert.equal(myHelper("input"), "output");
  });
});
```

Reference: `lib/family/invite.test.ts`.

### Before finishing

- [ ] New tests added for new logic
- [ ] Existing tests updated if behavior changed
- [ ] `npm test` passes
- [ ] Relevant Cypress spec passes (or note env requirements)

---

## New Module Checklist (copy before PR)

### Structure

- [ ] `app/(app)/<module>/page.tsx` — thin route
- [ ] `components/<module>/` — view + subcomponents
- [ ] `lib/<module>/types.ts` — types and validators
- [ ] `app/(app)/<module>/actions.ts` — Server Actions (if mutations)
- [ ] `lib/stores/<module>-store.ts` — Zustand (if client state)
- [ ] `lib/constants/` — new domain enums if the feature introduces statuses/types/tabs
- [ ] `lib/i18n` — all new strings (PL + EN + types)
- [ ] `supabase/migrations/` — if schema changes
- [ ] Dashboard link in `app/(app)/dashboard/page.tsx` when user-facing

### UI & state

- [ ] shadcn / existing components only
- [ ] Tailwind + `cn()` + theme tokens
- [ ] Zustand store with dedupe + loading flags (when data is shared or refetched)
- [ ] `useState<Type>(...)` with explicit types on every `useState`
- [ ] `useActionFeedback` for action toasts

### Safety & errors

- [ ] Server-side input validation
- [ ] Existence + ownership checks before mutate
- [ ] Supabase errors mapped to i18n (no raw messages)
- [ ] try/catch only where appropriate
- [ ] Route Handlers use correct HTTP status codes (if applicable)
- [ ] No SQL injection (parameterized queries / RPC only)
- [ ] No secrets in code

### Quality

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm test`
- [ ] Cypress updated/passing for affected flows

---

## Quick Reference — Existing Modules

| Module | Route | Store | Actions |
|--------|-------|-------|---------|
| Profile / settings | `/profile/settings` | `profile-store` | `app/(app)/account/actions.ts` |
| Family invites | settings tab `family` | `profile-store` | `family-invite-actions.ts` |
| Permissions | settings tab `permissions` | `profile-store` | `family-permissions-actions.ts` |
| Birthdays | `/birthdays` | — (local state + Supabase read) | `birthdays/actions.ts` |
| Notifications | `/notifications` | `notifications-store` | `notifications/actions.ts` |

When adding a module, mirror the closest row above.
