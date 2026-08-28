import { Router } from "express";
import { rateLimiter } from "../middleware/ratelimit.js";

import { verifyTurnstile } from "../middleware/turnstile.js";
import {
  submitFoundReport,
  handleScanEvent,
} from "../controllers/public.contoller.js";

const publicroutes = Router();

publicroutes.post(
  "/:shortCode/submitreport",
  rateLimiter,
  verifyTurnstile,
  submitFoundReport,
);

publicroutes.post("/:shortCode/scan", rateLimiter, handleScanEvent);

export default publicroutes;
