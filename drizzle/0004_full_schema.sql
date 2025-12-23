PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  avatar_url text,
  created_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  summary text,
  deadline integer NOT NULL,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  author_id text,
  author_avatar_url text,
  user_id text,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS proposals (
  id text PRIMARY KEY,
  project_id text,
  author_id text NOT NULL,
  author_avatar_url text,
  title text NOT NULL,
  description text,
  summary text,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  is_negative_initiative integer NOT NULL DEFAULT 0,
  user_id text,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id text PRIMARY KEY,
  proposal_id text,
  parent_id text,
  author_id text NOT NULL,
  author_avatar_url text,
  content text NOT NULL,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  user_id text,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS votes (
  proposal_id text NOT NULL,
  user_id text NOT NULL,
  value integer NOT NULL CHECK (value IN (1, -1)),
  PRIMARY KEY (proposal_id, user_id),
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);
