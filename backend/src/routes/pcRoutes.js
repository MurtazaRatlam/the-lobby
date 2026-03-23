import express from "express";
import { getPCs } from "../controllers/pcController.js";

const router = express.Router();
router.get("/", getPCs);

export default router;
