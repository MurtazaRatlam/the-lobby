import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const useSsl =
  process.env.DB_SSL === "false" || process.env.DB_SSL === "0"
    ? false
    : { rejectUnauthorized: false };

export default defineConfig({
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "the_lobby",
    ssl: useSsl
  }
});
