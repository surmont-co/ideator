# Changelog

## 0.2.0 - 2024-12-23

### Added
- Locale-aware translations (EN/RO) with header dropdown switcher and theme/logout controls styled as ghost buttons.
- Gemini-powered AI summaries for projects and proposals (locale-driven via `LOCALE`) with fallbacks when AI is unavailable.
- User persistence table linking projects, proposals, and comments to user records; automatic upsert on create/comment actions.
- Full-card navigation on the dashboard for quick access to project details.
- UI enhancements: clickable proposal cards with Markdown titles, improved discussion sheet styling, and proposal form redesign aligned with card actions.
- Project proposal form now performs live similarity checks (Jaccard, 75% threshold) against existing proposals on the same project, gating submission with a confirmation modal that lists close matches.
- Proposal summaries are generated asynchronously while typing and submitted with the form; submit is disabled during background checks/summarization.
- Project details now pass existing proposals to the form, and summary toggles retain glow state per page load; deadline formatting respects locale (RO/EN) with proper month casing/diacritics.
- Similarity modal now lets users upvote/downvote existing proposals directly; vote buttons match proposal footer styling and close the modal after casting.
- AI summary prompts enforce the `LOCALE` language (with diacritics) for proposal summaries.
- README rewritten for clarity on purpose, setup, and commands.

### Changed
- Dashboard, project details, and proposal lists now prefer AI summaries over full descriptions.
- Proposal form uses placeholders instead of labels and consolidates vote/select controls with the submit action.
- Header layout and navigation styling updated for contrast, accessibility, and consistent spacing.

### Fixed
- Addressed dark mode header contrast and hover timestamp visibility in discussions.
- Removed duplicate score display on proposals and stabilized action/footer layouts.
