# GEMINI.md: Project Ideator

## Directory Overview

This directory contains the source code and specifications for "Voter/Ideator", a web application for democratic prioritization of proposals.

## Project Overview

"Voter/Ideator" allows internal teams to collect, debate, and prioritize proposals.
*   **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, SQLite, Drizzle ORM.
*   **Auth:** WorkOS.
*   **UI:** Custom Accordion with Vote Bar Charts (Shadcn/Radix primitives).

## Development Protocols

### 1. Quality Assurance & Testing Strategy (MANDATORY)
**Tool:** Playwright (Node.js) with Headless Chromium.

Every frontend implementation or modification **must** be followed by a comprehensive Playwright test run. The goal is to ensure an impressive, functional, responsive, and accessible UI.

**Testing Checklist:**
*   **Functionality:** Verify critical user paths (voting, expanding accordion, submitting forms).
*   **Visual/UX:** Ensure components render correctly without layout shifts.
*   **Responsiveness:** Tests must run on both `Desktop Chrome` and `Mobile Chrome` (Pixel 5 emulation).
*   **Accessibility (A11y):** Use `@axe-core/playwright` to scan every new page/component for WCAG violations.

**Command:**
```bash
npx playwright test
```

### 2. Database Schema (SQLite)

Defined in `src/db/schema.ts` using Drizzle ORM.
*   **Projects:** Group proposals.
*   **Proposals:** The core items.
*   **Votes:** +1/-1 values.
*   **Comments:** Nested discussions.

### 3. Setup & Running

*   **Install:** `npm install`
*   **Dev Server:** `npm run dev`
*   **Database Studio:** `npx drizzle-kit studio`
*   **Auth Setup:** See `WORKOS_SETUP.md`

## Next Steps
*   Integrate WorkOS for authentication.
*   Implement real backend logic for proposals (replace Mockup).