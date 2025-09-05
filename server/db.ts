import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";
import * as sqliteSchema from "@shared/schema-sqlite";

neonConfig.webSocketConstructor = ws;

// Use SQLite for development, Neon for production
const isDevelopment = process.env.NODE_ENV === 'development';

let db: any;
let pool: any = null;

// Temporarily disable database for demo
if (false) {
  if (isDevelopment) {
    // Use SQLite for local development
    const sqlite = new Database('./dev.db');
    db = drizzleSQLite(sqlite, { schema: sqliteSchema });
  } else {
    // Use Neon for production
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  }
}

export { db, pool };