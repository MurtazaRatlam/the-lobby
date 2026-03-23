import express from "express";
import { downloadReportCsv, getReports } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getReports);
router.get("/csv", downloadReportCsv);

export default router;
