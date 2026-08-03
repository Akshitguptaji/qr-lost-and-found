import { Router } from "express";
import { rateLimiter } from "../middleware/ratelimit.js";

import { verifyTurnstile } from "../middleware/turnstile.js";
import { submitFoundReport } from "../controllers/public.contoller.js";

const publicroutes = Router();

publicroutes.post(
  "/:shortCode/submitreport",
  verifyTurnstile,
  rateLimiter,
  submitFoundReport,
);

export default publicroutes;
