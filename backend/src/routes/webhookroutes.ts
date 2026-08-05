import { Router } from "express";
import { handleResendWebhook } from "../controllers/wehbhook.controller.js";

const router = Router();

// Traffic cop: "POST to /resend? Go to handleResendWebhook."
router.post("/", handleResendWebhook);

export default router;
