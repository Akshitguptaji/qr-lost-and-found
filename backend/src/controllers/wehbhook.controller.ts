import type { Request, Response } from "express";
import { processDeliveryUpdate } from "../services/webhook.services.js";

export const handleResendWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    // Pass the raw data to the service layer to figure out
    await processDeliveryUpdate(type, data);

    // Resend requires a 200 OK immediately, or they will keep retrying
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Controller Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
