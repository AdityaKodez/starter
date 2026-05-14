<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context (for agents)

## Source of truth

- Treat the local docs in `node_modules/next/dist/docs/` as authoritative for Next.js behavior.
- Prefer reading existing code before making assumptions about patterns or utilities.

## Repo layout

- App router lives in `src/app/`.
- Shared UI and feature code lives in `src/components/` and `src/features/`.
- Prisma schema and migrations are in `prisma/`.

## Change discipline

- Make minimal, targeted edits; do not reformat unrelated files.
- If touching Next.js code, confirm the local docs first.
- Keep changes within the existing architecture unless explicitly asked to refactor.

## Data layer notes

- Prisma Client is generated into `src/generated/prisma/`.
- Prefer using existing helpers in `src/lib/` and `src/utils/` before adding new ones.
