CREATE TABLE IF NOT EXISTS users (
  id text primary key,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  avatar_url text,
  created_at integer default (CURRENT_TIMESTAMP)
);

ALTER TABLE projects ADD COLUMN user_id text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE proposals ADD COLUMN user_id text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE comments ADD COLUMN user_id text REFERENCES users(id) ON DELETE SET NULL;
