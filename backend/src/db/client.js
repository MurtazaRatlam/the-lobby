import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

dotenv.config();

const useSsl =
  process.env.DB_SSL === "false" || process.env.DB_SSL === "0"
    ? false
    : { require: true, rejectUnauthorized: false };

export const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "the_lobby",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  ...(useSsl ? { ssl: useSsl } : {})
});

export const db = drizzle(pool, { schema });
