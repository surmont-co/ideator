import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Use environment variable or default to local file
const sqlite = new Database(process.env.DATABASE_URL || 'database.sqlite');
export const db = drizzle(sqlite, { schema });
