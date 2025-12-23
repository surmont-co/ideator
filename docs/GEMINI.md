# GEMINI.md: Project Ideator

## Directory Overview

This directory contains the specifications for a web application called "Voter/Ideator". The purpose of this application is to facilitate the democratic prioritization of proposals within a company. It allows users to submit, discuss, and vote on ideas, with a clear visual representation of their popularity.

The project is currently in the planning phase, and no code has been written yet. The existing files are:

*   `request.md`: A high-level description of the application's features, written in Romanian.
*   `specs.md`: A detailed technical specification (Product Requirements Document) for the application, also in Romanian. It outlines the database schema, technology stack, and UI mockups.

## Project Overview

The "Voter/Ideator" is an internal web application for collecting, debating, and democratically prioritizing improvement proposals. The system is designed to provide a quick mathematical view of consensus (Pro vs. Con).

*   **Core Technologies:**
    *   **Database:** SQLite
    *   **Authentication:** WorkOS (for SSO/Google/Magic Link)
    *   **Frontend:** The specifications suggest a modern web framework like Next.js, Remix, or Go+Templ.
*   **Key Features:**
    *   **Project-based proposals:** Proposals are organized under projects, each with a title, description, and deadline.
    *   **Proposal submission:** Users can add proposals with a one-line definition and a detailed description. The system should check for duplicates.
    *   **Voting:** Users can cast a positive or negative vote on each proposal.
    *   **Accordion View:** Proposals are displayed in an accordion interface, ordered by the total number of votes. The background of each accordion item will be a bar chart representing the positive (green) and negative (red) votes.
    *   **Discussion:** Each proposal has a nested comment section for discussions.
    *   **Markdown Support:** All content (proposals and comments) supports Markdown.

## Database Schema (SQLite)

```sql
-- Projects (Ex: "Îmbunătățiri 2026")
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT, -- Markdown
    deadline DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Proposals
CREATE TABLE proposals (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    author_id TEXT NOT NULL, -- From WorkOS
    title TEXT NOT NULL,
    description TEXT, -- Markdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_negative_initiative BOOLEAN DEFAULT FALSE -- If the idea is "What to eliminate"
);

-- Votes (Unique per user/proposal)
CREATE TABLE votes (
    proposal_id TEXT REFERENCES proposals(id),
    user_id TEXT NOT NULL,
    value INTEGER CHECK (value IN (1, -1)),
    PRIMARY KEY (proposal_id, user_id)
);

-- Comments (With support for nesting/hierarchy)
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    proposal_id TEXT REFERENCES proposals(id),
    parent_id TEXT REFERENCES comments(id), -- For threads
    author_id TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development Conventions

As the project has not yet started, there are no established coding conventions. However, the `specs.md` file suggests a modern web development stack and practices.

## Building and Running

There are no build or run commands yet, as there is no code in the project.

**TODO:**

*   Initialize a new project using a modern web framework (e.g., Next.js, Remix, or Go with Templ).
*   Implement the database schema using SQLite.
*   Develop the UI components, starting with the accordion with the background bar chart.
*   Implement the backend logic for proposals, voting, and comments.
*   Integrate WorkOS for authentication.
