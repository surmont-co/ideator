import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Use WorkOS user id or email if unavailable
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Projects (Ex: "Îmbunătățiri 2026")
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  title: text('title').notNull(),
  description: text('description'), // Markdown
  summary: text('summary'), // AI short summary
  deadline: integer('deadline', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  authorId: text('author_id'), // Legacy user id/email
  authorAvatarUrl: text('author_avatar_url'), // Avatar URL
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
});

// Proposals
export const proposals = sqliteTable('proposals', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(), // From WorkOS
  authorAvatarUrl: text('author_avatar_url'), // Add avatar
  title: text('title').notNull(),
  description: text('description'), // Markdown
  summary: text('summary'), // AI short summary
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  isNegativeInitiative: integer('is_negative_initiative', { mode: 'boolean' }).default(false), // If the idea is "What to eliminate"
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
});

// Votes (Unique per user/proposal)
export const votes = sqliteTable('votes', {
  proposalId: text('proposal_id').notNull().references(() => proposals.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  value: integer('value').notNull(), // 1 or -1. Check constraint handles in app logic or raw sql, sqlite doesn't enforce standard CHECK via simple ORM definitions easily without raw sql
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.proposalId, table.userId] }),
  };
});

// Comments (With support for nesting/hierarchy)
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  proposalId: text('proposal_id').references(() => proposals.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'), // Self-reference handled in application logic usually, or explicit raw foreign key if strictly needed
  authorId: text('author_id').notNull(),
  authorAvatarUrl: text('author_avatar_url'), // Add avatar
  content: text('content').notNull(), // Markdown
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
});
