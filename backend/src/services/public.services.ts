import { prisma } from "../config/prisma.js";
import type { ReportStatus } from "@prisma/client";
import { dispatchOwnerWebhook } from "../services/webhook.dispatch.services.js";
import { sendOwnerNotification } from "./email.service..js";

// Define exactly what the service expects to receive
interface ReportPayload {
  ipHash?: string;
  userAgent?: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  message?: string;
  finderContact?: string;
  status?: ReportStatus;
}

export const createReportService = async (
  shortCode: string,
  data: ReportPayload,
) => {
  const item = await prisma.item.findUnique({
    where: { shortCode },
    include: { user: true },
  });

  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }

  const { report, notificationLog } = await prisma.$transaction(async (tx) => {
    // Step A: Log the raw scan event
    const scan = await tx.scanEvent.create({
      data: {
        itemId: item.id,
        ipHash: data.ipHash ?? null, // Using ?? to avoid 0 bugs
        userAgent: data.userAgent ?? null, // Using ??
      },
    });

    // Step B: Create the actual report
    const report = await tx.foundReport.create({
      data: {
        itemId: item.id,
        scanEventId: scan.id,
        latitude: data.latitude ?? null, // Using ?? to preserve 0 coordinates
        longitude: data.longitude ?? null, // Using ?? to preserve 0 coordinates
        accuracyMeters: data.accuracyMeters ?? null,
        message: data.message ?? null, // Assumes 'message String?' in your schema
        finderContact: data.finderContact ?? null,
      },
    });

    // Step C: Log the pending email notification
    const notificationLog = await tx.notificationLog.create({
      data: {
        reportId: report.id,
        channel: "EMAIL",
        status: "PENDING",
      },
    });

    return { report, notificationLog };
  });

  // 3. Fire off the email asynchronously (Fire-and-Forget)
  // FIXED: Using item.user.email to match the Prisma include

  /**
   * this is a webhook dispatch to the owner of the item, notifying them that their item has been found.
   * we r not using this rn cause i dont understand how to use it rn, but we will use it in the future.
   */
  sendOwnerNotification({
    email: item.user.email,
    itemName: item.label,
    reportData: report,
    logId: notificationLog.id,
  }).catch((error: any) => {
    console.error(`Failed to send email for report ${report.id}:`, error);
  });
  // const webhookPayload = {
  //   event: "item.scanned",
  //   itemId: item.id,
  //   itemName: item.label, // Using item.label based on your schema
  //   message: report.message,
  //   contact: report.finderContact,
  //   scannedAt: new Date().toISOString(),
  // };
  // dispatchOwnerWebhook(item.userId, webhookPayload).catch((err: any) => {
  //   console.error("Background webhook dispatch failed:", err);
  // });
  return report;
};
