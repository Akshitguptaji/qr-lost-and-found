import type { Request, Response } from "express";
import { encryptSecret } from "../services/webhook.dispatch.services.js"; // Point this to the file you just showed me
import { prisma } from "../config/prisma.js";

export const setupUserWebhook = async (req: Request, res: Response) => {
  try {
    // I am assuming you pass userId in the body, or get it from your auth middleware (e.g., req.user.id)
    const { userId, url, secret } = req.body;

    if (!userId || !url || !secret) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userId, url, or secret" });
    }

    // 1. Encrypt their raw secret using your function
    const encryptedSecret = encryptSecret(secret);

    // 2. Save or update it in the database
    const webhook = await prisma.webhookConfig.upsert({
      where: { userId: userId }, // Assuming one webhook per user
      update: {
        url,
        secret: encryptedSecret,
        isActive: true,
        failureCount: 0,
      },
      create: {
        userId,
        url,
        secret: encryptedSecret,
        isActive: true,
      },
    });

    res.status(200).json({ message: "Webhook saved successfully!" });
  } catch (error) {
    console.error("Error saving webhook:", error);
    res.status(500).json({ error: "Failed to set up webhook" });
  }
};
