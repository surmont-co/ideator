# Changelog

## 0.3.0 - 2024-12-24

### Added
- AI similarity checks now call Gemini with OpenAI fallback, throttle misbehaving providers for 15 minutes, and log requests/responses in dev.
- Similarity modal shows AI-written explanations with percent-based background; vote buttons on hover allow up/downvoting existing proposals directly.
- Proposal summaries are generated server-side on submit via AI (locale-aware); client no longer makes per-keystroke summary calls.
- README rewritten for clearer purpose, setup, and commands.
- Similarity parsing handles JSON maps/regex fallback to avoid empty matches.

### Changed
- If no positive similarity scores are returned, the new proposal submits immediately without showing the modal; zero-similarity items are hidden.
- Modal layout tweaks: centered, wider width cap, hoverable vote buttons overlaying text, and percent-only background bar.
- Deadline formatting uses locale-aware months (RO diacritics) and time formats (24h RO, 12h EN).

### Fixed
- Resilience against LLM rate limits with provider failover; better logging for debugging AI output quality.

## 0.2.0 - 2024-12-23

### Added
- Locale-aware translations (EN/RO) with header dropdown switcher and theme/logout controls styled as ghost buttons.
- Gemini-powered AI summaries for projects and proposals (locale-driven via `LOCALE`) with fallbacks when AI is unavailable.
- User persistence table linking projects, proposals, and comments to user records; automatic upsert on create/comment actions.
- Full-card navigation on the dashboard for quick access to project details.
- UI enhancements: clickable proposal cards with Markdown titles, improved discussion sheet styling, and proposal form redesign aligned with card actions.
- Project proposal form now performs live similarity checks (Jaccard, 75% threshold) against existing proposals on the same project, gating submission with a confirmation modal that lists close matches.
- Proposal summaries are generated on submit via AI (with locale prompt) before insertion; client-side typing no longer triggers summary calls.
- Project details now pass existing proposals to the form, and summary toggles retain glow state per page load; deadline formatting respects locale (RO/EN) with proper month casing/diacritics.
- Similarity modal now lets users upvote/downvote existing proposals directly; vote buttons match proposal footer styling and close the modal after casting.
- AI summary prompts enforce the `LOCALE` language (with diacritics) for proposal summaries.
- README rewritten for clarity on purpose, setup, and commands.
- Similarity detection now runs via AI at submit time with a blocking wait modal; AI returns human explanations and percentages, and suggestions only show above 75% similarity.
- Logged AI similarity prompts and responses (dev-only) to inspect quality and explanations; fallback remains for missing/failed AI.
- LLM calls now fail over from Gemini to OpenAI using env vars (`GEMINI_*`, `OPENAI_*`), throttling a provider for 15 minutes after 429 responses.

### Changed
- Dashboard, project details, and proposal lists now prefer AI summaries over full descriptions.
- Proposal form uses placeholders instead of labels and consolidates vote/select controls with the submit action.
- Header layout and navigation styling updated for contrast, accessibility, and consistent spacing.

### Fixed
- Addressed dark mode header contrast and hover timestamp visibility in discussions.
- Removed duplicate score display on proposals and stabilized action/footer layouts.
