<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nimbusly agent instructions

Before implementing features or non-trivial changes, read and follow:

1. **`.cursor/rules/project-fundamentals.instructions.md`** — stack, commands, folder structure, i18n, Supabase, styling
2. **`.cursor/rules/new-module-or-change.instructions.md`** — new modules: shadcn, Zustand, Tailwind, tests, error handling checklist

When work touches a specific area, prefer matching existing patterns in that domain (`components/`, `lib/stores/`, `app/(app)/*/actions.ts`).
