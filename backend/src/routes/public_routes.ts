import { Router } from "express";
import { rateLimiter } from "../middleware/ratelimit.js";

import { verifyTurnstile } from "../middleware/turnstile.js";
import { submitFoundReport } from "../controllers/public.contoller.js";

const publicroutes = Router();

publicroutes.post(
  "/:shortCode/submitreport",
  rateLimiter,
  verifyTurnstile,
  submitFoundReport,
);

export default publicroutes;
