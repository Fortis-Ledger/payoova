import { defineConfig } from "drizzle-kit";

const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig({
  out: "./migrations",
  schema: isDevelopment ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: isDevelopment ? "sqlite" : "postgresql",
  dbCredentials: isDevelopment 
    ? { url: "file:./dev.db" }
    : { url: process.env.DATABASE_URL! },
});
