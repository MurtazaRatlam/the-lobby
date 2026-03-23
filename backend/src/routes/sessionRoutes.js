import express from "express";
import {
  addSessionProduct,
  getDashboardSummary,
  logoutSession,
  pauseSession,
  removeSessionProduct,
  resumeSession,
  startSession
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start", startSession);
router.get("/dashboard-summary", getDashboardSummary);
router.post("/:sessionId/products", addSessionProduct);
router.delete("/:sessionId/products/:lineId", removeSessionProduct);
router.post("/:sessionId/pause", pauseSession);
router.post("/:sessionId/resume", resumeSession);
router.patch("/:sessionId/logout", logoutSession);

export default router;
