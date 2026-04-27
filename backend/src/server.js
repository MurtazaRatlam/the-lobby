import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./db/index.js";
import { seedPCsIfEmpty } from "./seed/seedPCs.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
    } finally {
      client.release();
    }
    await seedPCsIfEmpty();
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
};

start();
