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

  // Keep the transaction, just use it for the Report and the Log
  const { report, notificationLog } = await prisma.$transaction(async (tx) => {
    // Step B: Create the actual report
    const report = await tx.foundReport.create({
      data: {
        itemId: item.id,
        // scanEventId is completely removed from here
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        accuracyMeters: data.accuracyMeters ?? null,
        message: data.message ?? null,
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

  sendOwnerNotification({
    email: item.user.email,
    itemName: item.label,
    reportData: report,
    logId: notificationLog.id,
  }).catch((error: any) => {
    console.error(`Failed to send email for report ${report.id}:`, error);
  });

  return report;
};
export const logScanEvent = async (
  shortCode: string,
  ipHash: string,
  userAgent: string,
) => {
  const item = await prisma.item.findUnique({
    where: { shortCode },
  });
  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }
  const scan = await prisma.scanEvent.create({
    data: {
      itemId: item.id,
      ipHash: ipHash || null,
      userAgent: userAgent || null,
    },
  });
  return scan;
};
