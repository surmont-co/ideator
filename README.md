# Ideator

Next.js App Router project for democratic prioritization of proposals with AI-assisted summaries, i18n (EN/RO), and WorkOS auth.

## Quickstart
1) Install deps: `npm install`
2) Env vars: copy `.env.local` and fill:
   - `WORKOS_CLIENT_ID`, `WORKOS_SECRET_KEY`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`, `WORKOS_COOKIE_PASSWORD`
   - `DATABASE_URL` (defaults to `database.sqlite`)
   - `GEMINI_API_KEY` (required for AI summaries)
   - `LOCALE` (`en` or `ro`, default `en`)
3) DB: run the SQL migrations in `drizzle/` (`0000_*.sql`, `0001_add_summaries.sql`, `0002_add_users_table_and_links.sql`, `0003_add_author_columns.sql`) against your SQLite file. Example: `sqlite3 database.sqlite < drizzle/0000_flippant_zemo.sql` then apply the subsequent files in order.
4) Dev server: `npm run dev` (http://localhost:3000)
5) Lint: `npm run lint`

## Features
- WorkOS authentication protects all app routes.
- EN/RO translations with header dropdown locale selector; default from `LOCALE` or cookie.
- AI summaries via Gemini for projects/proposals (fallback to trimmed description if unavailable).
- User records stored in `users` table; projects/proposals/comments reference user_id and legacy author fields.
- Dashboard cards are fully clickable to project details; proposals support Markdown titles/descriptions and localized UI copy.
- Discussion sheet with hover timestamps and accessible overlay.

## Testing
- Lint: `npm run lint`
- Playwright (if configured locally): `npx playwright test`

## Deployment Notes
- Ensure `.env.local` is present in the runtime with Gemini and WorkOS keys.
- Apply Drizzle SQL migrations to your target database before starting the server.
