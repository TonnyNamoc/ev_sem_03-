// src/routes/metrics.routes.js
import { Router } from "express";
import { summary, addedTodayByName, ping } from "../controllers/metrics.controller.js";

const router = Router();

router.get("/ping", ping);
router.get("/summary", summary);
router.get("/added-today", addedTodayByName);

export default router;
