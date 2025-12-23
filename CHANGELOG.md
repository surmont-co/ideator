# Changelog

## 0.2.0 - 2024-12-23

### Added
- Locale-aware translations (EN/RO) with header dropdown switcher and theme/logout controls styled as ghost buttons.
- Gemini-powered AI summaries for projects and proposals (locale-driven via `LOCALE`) with fallbacks when AI is unavailable.
- User persistence table linking projects, proposals, and comments to user records; automatic upsert on create/comment actions.
- Full-card navigation on the dashboard for quick access to project details.
- UI enhancements: clickable proposal cards with Markdown titles, improved discussion sheet styling, and proposal form redesign aligned with card actions.

### Changed
- Dashboard, project details, and proposal lists now prefer AI summaries over full descriptions.
- Proposal form uses placeholders instead of labels and consolidates vote/select controls with the submit action.
- Header layout and navigation styling updated for contrast, accessibility, and consistent spacing.

### Fixed
- Addressed dark mode header contrast and hover timestamp visibility in discussions.
- Removed duplicate score display on proposals and stabilized action/footer layouts.
