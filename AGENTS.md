<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nimbusly agent instructions

Before implementing features or non-trivial changes, read and follow:

1. **`.cursor/rules/project-fundamentals.instructions.md`** - stack, commands, folder structure, i18n, Supabase, styling
2. **`.cursor/rules/new-module-or-change.instructions.md`** - new modules: shadcn, Zustand, Tailwind, tests, error handling checklist

When work touches a specific area, prefer matching existing patterns in that domain (`components/`, `lib/stores/`, `app/(app)/*/actions.ts`).

## Versioning & change log (mandatory)

**Always** update the changelog when you finish a feature, bugfix, or any change users would notice (UI, API, env vars, PWA, emails, migrations, etc.). Do not leave changelog updates for later or for the user to ask.

When you ship work:

1. Add a new entry at the **top** of `lib/changelog/entries.ts` (newest first).
2. Bump `version` in `package.json` to **match that top entry** (`major` / `minor` / `fix` - semver-style).
3. Write **both** PL and EN `title` + `changes` bullets in the entry.
4. Use `CHANGELOG_ENTRY_TYPE` from `lib/constants/changelog.ts` (`major` | `minor` | `fix`).
5. Update **`README.md`** - current version; also features, env vars, or testing notes when behaviour changed.
6. Add or update **tests** for changed behaviour; run **`yarn validate`** before finishing.

Multiple fixes in one session → one new version per logical release, or a single entry that lists all shipped changes. Never commit user-visible work without a changelog entry.

The public page `/change-log` and the bottom-right version badge read from `lib/changelog/entries.ts` automatically.

Full checklist: [`.cursor/rules/new-module-or-change.instructions.md`](.cursor/rules/new-module-or-change.instructions.md) → **Change log**.

## Nimbus companion

Nimbus is a first-class product surface - not an afterthought. When you **create a module**, **develop or change module UX**, or **ship user-visible navigation changes**, update Nimbus in the **same change**:

- Tour steps + `data-nimbus-tour` targets on the affected views
- PL/EN copy in `lib/i18n/nimbus-messages.ts` (and summaries when tour scope changes)
- Context hints, FAQ entries, and cross-module suggestions where relevant
- Unit tests under `tests/unit/nimbus/`

Full checklist: [`.cursor/rules/new-module-or-change.instructions.md`](.cursor/rules/new-module-or-change.instructions.md) → **Nimbus companion**.
