import type { Request, Response } from "express";
import { getIpHash } from "../utils/hash.util.js";
import { createReportService } from "../services/public.services.js";

// Explicitly type req and res, and return type
export const submitFoundReport = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { shortCode } = req.params;
  if (!shortCode || typeof shortCode !== "string") {
    return res.status(400).json({ error: "Missing or invalid shortCode" });
  }
  const {
    latitude,
    longitude,
    accuracyMeters,
    message,
    finderContact,
    honeypot,
  } = req.body;

  // 1. Bot Trap (Honeypot)
  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  // 2. Data Validation
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Never trust client GPS data. Restore the bounds checking.
  if (latitude != null && (latitude < -90 || latitude > 90)) {
    return res.status(400).json({ error: "Invalid latitude" });
  }
  if (longitude != null && (longitude < -180 || longitude > 180)) {
    return res.status(400).json({ error: "Invalid longitude" });
  }

  // 3. Extract tracking data for the ScanEvent
  const ipHash = getIpHash(req);
  const userAgent = (req.headers["user-agent"] as string) || "unknown";
  // 4. Hand off to the Service
  try {
    await createReportService(shortCode, {
      latitude,
      longitude,
      accuracyMeters,
      message,
      finderContact,
      ipHash,
      userAgent,
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    if (err.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({ error: "Invalid QR code" });
    }

    console.error(`Database error for item ${shortCode}:`, err);
    // Fixed your "eraror" typo here
    return res.status(500).json({ error: "Internal server error" });
  }
};
