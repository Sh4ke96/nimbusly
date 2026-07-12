# New Module or Change - Instructions

Use this checklist for **every new feature module** or **non-trivial change** in Nimbusly.

See also: [`project-fundamentals.instructions.md`](project-fundamentals.instructions.md)

---

## Before You Code

1. Read existing code in the same domain (`components/<feature>/`, `lib/<feature>/`, `app/(app)/<feature>/`).
2. Check `components/ui/` for shadcn primitives you can reuse.
3. Check `lib/stores/` for existing Zustand stores - extend before creating a new one.
4. If the feature touches the DB, plan a migration in `supabase/migrations/`.

---

## UI & Styling (mandatory)

### shadcn / existing components

- **Always** build UI from `components/ui/*` (Button, Card, Dialog, Input, Tabs, Skeleton, …).
- **Reuse** feature components already in the repo (e.g. `AppHeader`, `AccountBreadcrumbs`, `MemberAvatar`, `SettingsFormFooter`).
- Add a new shadcn component only when nothing existing fits - install via shadcn CLI, keep in `components/ui/`.
- **Do not** create parallel Button/Modal/Input implementations.

### Tailwind only

- Style with **Tailwind utility classes** in TSX.
- Merge classes with `cn()` from `@/lib/utils`.
- Use theme tokens (`bg-primary`, `text-muted-foreground`, `border-border`) - no random hex colors.
- Keep brand style: **`rounded-none`**, fonts from `globals.css`.
- Global overrides for third-party widgets go in `app/globals.css`, not inline hacks.

### i18n (mandatory)

- All user-visible strings via `useT()` (client) or `getServerT()` (server).
- Add keys to `lib/i18n/types.ts`, `pl.ts`, and `en.ts` **in the same change**.
- Use `formatMessage()` for `{placeholder}` templates - no string concatenation for copy.
- Use ASCII hyphen `-` only - no em dash (`—`) or en dash (`–`) in user-facing strings or docs.
- Emails, metadata, calendar month names, and role labels → translation files, not inline PL/EN objects.
- Both **Polish and English** are required for every new module.

### Change log, README, version & tests (mandatory)

**Always** update the changelog when completing work that changes the product (new module, feature, bugfix, PWA, notifications, emails, env vars, migrations with user impact, etc.). The agent must not wait for the user to ask for a changelog entry.

When shipping:

1. Prepend an entry to `lib/changelog/entries.ts` (newest release first).
2. Set `version` in `package.json` to the **same** version string as that top entry.
3. Fill `title` and `changes` in **both** `pl` and `en`.
4. Pick `type`: `CHANGELOG_ENTRY_TYPE.MAJOR` (big launch), `MINOR` (feature), or `FIX` (bugfix).
5. Update **`README.md`** in the same change - at minimum the current version; also features, env vars, scripts, or testing notes when behaviour changed.
6. Add or update **tests** for new logic (`tests/unit/`, `tests/integration/`, `tests/e2e/` as appropriate) and run **`yarn validate`**.

`/change-log` is public (no login). The version badge (`vX.Y.Z`, bottom-right) links there.

Skip a version bump only for purely internal refactors with no user-visible or operational impact; when unsure, add a `fix` entry.

### Domain constants (mandatory)

- New domain values (statuses, types, tabs, roles) → `lib/constants/<domain>.ts` with `as const` + exported type.
- Import constants in components, stores, and Server Actions - no magic strings.
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
- Selectors: `useStore((s) => s.field)` - avoid subscribing to the whole store.
- Bootstrap session-level data once (see `ProfileBootstrap`) - do not refetch profile on every mount.

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

Server Actions do not use HTTP status codes - return `{ error: t.... }` with a **specific, translated** message that matches the situation (unauthorized, not found, validation, generic).

---

## Error Handling Checklist

### try/catch

- Wrap **non-critical side effects** (e.g. sending notifications) in `try/catch` so the main operation still succeeds.
- For **critical paths** (DB write, payment, etc.): check `error` from Supabase; do not swallow failures silently.
- Never expose raw DB/PostgREST messages to users - map to i18n keys.

### Input validation (≈ HTTP 400)

Validate **on the server** before any write:

- Required fields present and trimmed
- Types and ranges (dates, enums, string length)
- Domain rules (`isValidBirthDate`, invite code format, etc.)

```ts
if (!personName) return { error: t.birthdays.errorPersonName };
if (!isValidBirthDate(month, day)) return { error: t.birthdays.errorInvalidDate };
```

Client-side `required` / `maxLength` is UX only - server validation is mandatory.

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
- Migrations and RPC bodies live in `supabase/migrations/` - review any dynamic SQL there.
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
5. Run `yarn db:push`
6. Update TypeScript types in `lib/<domain>/types.ts`

---

## Tests (mandatory)

### Always write or update tests

| Change type | Required tests |
|-------------|----------------|
| New pure helpers (`lib/**/helpers.ts`, validators, formatters) | `tests/unit/**/*.test.ts` or `tests/integration/**/*.test.ts` for Server Action logic |
| New user flow (auth, onboarding, settings, invites) | Cypress spec in `tests/e2e/` or extend existing |
| Bug fix | Regression test when feasible |

### Commands

```bash
yarn validate          # lint + types + unit tests + build
yarn test              # unit tests only
yarn e2e           # full E2E (dev server + Cypress)
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

Reference: `tests/unit/family/invite.test.ts`.

### Before finishing

- [ ] New tests added for new logic
- [ ] Existing tests updated if behavior changed
- [ ] `yarn validate` passes
- [ ] Relevant Cypress spec passes (or note env requirements)

---

## New Module Checklist (copy before PR)

### Structure

- [ ] `app/(app)/<module>/page.tsx` - thin route
- [ ] `components/<module>/` - view + subcomponents
- [ ] `lib/<module>/types.ts` - types and validators
- [ ] `app/(app)/<module>/actions.ts` - Server Actions (if mutations)
- [ ] `lib/stores/<module>-store.ts` - Zustand (if client state)
- [ ] `lib/constants/` - new domain enums if the feature introduces statuses/types/tabs
- [ ] `lib/i18n` - all new strings (PL + EN + types)
- [ ] `supabase/migrations/` - if schema changes
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

- [ ] `yarn validate`
- [ ] Cypress updated/passing for affected flows
- [ ] **Changelog:** new entry at top of `lib/changelog/entries.ts` (PL + EN) + `package.json` version bump (required for any shipped feature/fix)
- [ ] `README.md` updated (version, features, env, or testing notes if changed)

---

## Nimbus companion (mandatory when module UX changes)

Nimbus helps users discover and learn the app. **Any new module, meaningful module change, or new user-facing screen** must include a Nimbus update in the same PR - do not defer.

### New module checklist

- [ ] `NIMBUS_TOUR_ID` + steps in `lib/nimbus/tour-catalog.ts`
- [ ] `NIMBUS_TOUR_TARGET.*` in `lib/constants/nimbus-tour.ts` + `data-nimbus-tour` on view components
- [ ] Tour step copy PL/EN in `lib/i18n/nimbus-messages.ts` (`modules.<id>.*`)
- [ ] Module summary in `lib/i18n/nimbus-tour-summaries.ts`
- [ ] `NIMBUS_PATH_TOUR` entry for `/your-route`
- [ ] Context hint: `lib/nimbus/context-hints.ts` + `companion.context.<key>`
- [ ] FAQ entry if users commonly ask “how do I…?” → `lib/nimbus/faq.ts` + `companion.faq`
- [ ] Cross-module suggestion rules if applicable → `lib/nimbus/suggestions.ts` + `suggestion-links.ts`
- [ ] Celebration hook if “first X” is meaningful → `lib/nimbus/celebrations.ts` + form dialog
- [ ] Unit tests in `tests/unit/nimbus/` (tour catalog, suggestions, faq hrefs, etc.)

### Changing an existing module

- [ ] Add/rename/remove tour steps when UI layout changes
- [ ] Update `data-nimbus-tour` anchors when buttons or sections move
- [ ] Refresh FAQ or hints if behaviour changed
- [ ] Extend tests when detection rules or tour ids change

### Key paths

```
lib/nimbus/           tours, hints, suggestions, faq, celebrations
lib/constants/nimbus-tour.ts
lib/i18n/nimbus-messages.ts
lib/i18n/nimbus-tour-summaries.ts
components/nimbus/    companion UI, driver tour, menu
tests/unit/nimbus/
```

---

## Quick Reference - Existing Modules

| Module | Route | Store | Actions |
|--------|-------|-------|---------|
| Profile / settings | `/profile/settings` | `profile-store` | `app/(app)/account/actions.ts` |
| Family invites | settings tab `family` | `profile-store` | `family-invite-actions.ts` |
| Permissions | settings tab `permissions` | `profile-store` | `family-permissions-actions.ts` |
| Dashboard | `/dashboard` | multiple (overview cards) | - |
| Budget | `/budget` | `budget-store` | `budget/actions.ts` |
| Shopping lists | `/shopping` | `shopping-lists-store` | `shopping/actions.ts` |
| Gifts | `/gifts` | `gifts-store` | `gifts/actions.ts` |
| Birthdays | `/birthdays` | `birthdays-store` | `birthdays/actions.ts` |
| Work schedule | `/schedule` | `schedule-store` | `schedule/actions.ts` |
| Medicine cabinet | `/medicine-cabinet` | `medicine-store` | `medicine-cabinet/actions.ts` |
| Watchlist | `/watchlist` | `watchlist-store` | `watchlist/actions.ts` |
| Restaurants | `/restaurants` | `restaurants-store` | `restaurants/actions.ts` |
| Pets | `/pets` | `pets-store` | `pets/actions.ts` |
| Chores | `/chores` | `chores-store` | `chores/actions.ts` |
| Notes | `/notes` | `notes-store` | `notes/actions.ts` |
| Notifications | `/notifications` | `notifications-store` | `notifications/actions.ts` |

When adding a module, mirror the closest row above and complete the **Nimbus companion** checklist in this file.
