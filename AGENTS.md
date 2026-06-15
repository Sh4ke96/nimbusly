<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nimbusly agent instructions

Before implementing features or non-trivial changes, read and follow:

1. **`.cursor/rules/project-fundamentals.instructions.md`** — stack, commands, folder structure, i18n, Supabase, styling
2. **`.cursor/rules/new-module-or-change.instructions.md`** — new modules: shadcn, Zustand, Tailwind, tests, error handling checklist

When work touches a specific area, prefer matching existing patterns in that domain (`components/`, `lib/stores/`, `app/(app)/*/actions.ts`).

## Versioning & change log

When you ship a **new module**, **meaningful feature**, or **user-visible fix**:

1. Add a new entry at the **top** of `lib/changelog/entries.ts` (newest first).
2. Bump `version` in `package.json` to match that entry (`major` / `minor` / `fix` — semver-style).
3. Write **both** PL and EN `title` + `changes` bullets in the entry.
4. Use `CHANGELOG_ENTRY_TYPE` from `lib/constants/changelog.ts` (`major` | `minor` | `fix`).

The public page `/change-log` and the bottom-right version badge read from this file automatically.
