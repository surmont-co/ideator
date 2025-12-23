ALTER TABLE projects ADD COLUMN author_id text;
ALTER TABLE projects ADD COLUMN author_avatar_url text;
ALTER TABLE proposals ADD COLUMN author_avatar_url text;
ALTER TABLE comments ADD COLUMN author_avatar_url text;
