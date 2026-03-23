import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes.js";
import pcRoutes from "./routes/pcRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/customers", customerRoutes);
app.use("/api/pcs", pcRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/products", productRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
