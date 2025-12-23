# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router routes, layouts, and pages; treat route segments as feature entry points.
- `src/components`: Shared UI primitives and composites; prefer co-locating feature-only components near their route when possible.
- `src/lib`: Utilities (validation, helpers) and cross-cutting logic.
- `src/db`: Drizzle schema and data access helpers; `drizzle/` holds migrations/config, `database.sqlite` is the local dev store.
- `public/`: Static assets (images, fonts). `docs/`: specs, UI reports, and requests.
- `tests/`: Playwright end-to-end specs; `playwright.config.ts` configures base URL and trace/screenshot output.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js dev server at `http://localhost:3000`.
- `npm run build`: Production build (fails on type or build errors).
- `npm run start`: Run the compiled production server.
- `npm run lint`: ESLint across the repo (Next.js rules).
- `npx playwright test`: Run e2e tests in `tests/`; use `--ui` to debug, `--headed` for visible browsers.

## Coding Style & Naming Conventions
- Language: TypeScript + React (App Router). Prefer functional components and hooks; keep server/client components clear.
- Styling: Tailwind (v4) + Radix UI; keep class usage minimal and rely on design tokens/utilities from existing components.
- Indentation: 2 spaces; avoid trailing whitespace. Use descriptive prop and handler names (`onVote`, `projectId`).
- Imports: Absolute from `src/` when reasonable; group React/Next, third-party, internal, then styles.
- Linting: Fix ESLint findings before pushing; align with Next.js conventions.

## Testing Guidelines
- Framework: Playwright; tests live in `tests/*.spec.ts`.
- Naming: Use descriptive spec names (feature-based) and meaningful test titles; prefer data-testids over text selectors when adding new UI.
- Running: `npx playwright test` locally; add `--project=chromium` for a single browser. Keep deterministic (no time-based waits; use expect-based waits).
- Add tests for new user flows (creation/edit/delete) and regressions before merging.

## Commit & Pull Request Guidelines
- Commits: Short, imperative subject lines (`Add proposal validation`, `Fix proposal list spacing`); group related changes.
- PRs: Include summary, screenshots/GIFs for UI changes, linked issue/Task ID, and test evidence (`npx playwright test` or rationale if skipped).
- Keep diffs focused; avoid bundling unrelated refactors with feature work.

## Security & Configuration Tips
- Secrets: Use `.env.local` for keys/tokens; never commit secrets. Document new env vars in PRs.
- Database: `database.sqlite` is for local dev only; do not ship sensitive data. Run migrations via `drizzle-kit` if schema changes.
- Accessibility: Maintain contrast, focus states, and keyboard paths when adding UI; update tests to cover key interactions.
