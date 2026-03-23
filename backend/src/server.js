import dotenv from "dotenv";
import app from "./app.js";
import db from "./models/index.js";
import { seedPCsIfEmpty } from "./seed/seedPCs.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();
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
