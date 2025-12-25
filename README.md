# Ideator

Platformă Next.js (App Router) pentru inițiative de echipă: proiecte, propuneri, voturi și discuții, cu sumarizare AI (Gemini), i18n (EN/RO) și autentificare WorkOS.

## Ce face
- Creezi proiecte cu termene și descrieri; sumarul se generează automat (sau fallback la descriere).
- Adaugi propuneri pe proiecte, fiecare cu sumar AI în timp real și vot inițial.
- Detector de similitudine: în timpul completării, sunt semnalate propuneri existente similare și poți vota direct din modal.
- Voturi și discuții pe propuneri; titluri/descrieri în Markdown.
- Interfață localizată EN/RO; formate de dată și sumar AI țin cont de `LOCALE`.

## Setup rapid
1) Instalează dependențe: `npm install`
2) Configurează `.env.local` (copie din exemplu dacă există):
   - WorkOS: `WORKOS_CLIENT_ID`, `WORKOS_SECRET_KEY`, `WORKOS_API_KEY`, `WORKOS_REDIRECT_URI`, `WORKOS_COOKIE_PASSWORD`
   - Bază de date: `DATABASE_URL` (implicit `database.sqlite`)
   - AI: `GEMINI_API_KEY` (obligatoriu pentru sumarizare)
   - Locale: `LOCALE` (`en` sau `ro`, default `en`)
3) Bază de date (SQLite):
   - Rulează migrările din `drizzle/` în ordine (`0000_*.sql`, `0001_add_summaries.sql`, `0002_add_users_table_and_links.sql`, `0003_add_author_columns.sql`, `0004_full_schema.sql` dacă o folosești).
   - Exemplu: `sqlite3 database.sqlite < drizzle/0000_flippant_zemo.sql` apoi celelalte în ordine.
4) Pornește dev server: `npm run dev` (http://localhost:3000)
5) Lint: `npm run lint`

## Comenzi utile
- Dev: `npm run dev`
- Build: `npm run build`
- Start producție: `npm run start`
- Lint: `npm run lint`
- (Opțional) E2E: `npx playwright test`

## Note de deploy
- Asigură `.env.local` cu cheile WorkOS și Gemini pe mediu.
- Aplică migrările SQL pe baza țintă înainte de rulare.
- Setează `LOCALE` pentru limba implicită a UI și a sumarizării AI.
- Docker: fișierele sunt în `.docker/` (`Dockerfile`, `docker-compose.yml`) ca să evităm detectarea automată pe hosting; pornește cu `docker compose -f .docker/docker-compose.yml up --build`.
