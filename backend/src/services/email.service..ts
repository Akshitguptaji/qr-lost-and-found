// This handles Nodemailer logic to fire off alerts to the owner.
import { prisma } from "../config/prisma.js";
import nodemailer from "nodemailer";
import type { FoundReport } from "@prisma/client";


// Set up the Nodemailer transporter using Gmail
// Do this OUTSIDE the function so it doesn't rebuild the connection every single time
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
  throw new Error(
    "CRITICAL: FRONTEND_URL is missing from environment variables.",
  );
}
export interface NotificationParams {
  email: string;
  itemName: string;
  reportData: FoundReport;
  logId: string;
}

export const sendOwnerNotification = async (params: NotificationParams) => {
  

  try {
    // Destructure reportData for cleaner code inside the HTML
    const { id, message, finderContact } = params.reportData;

    // 1. Send the email via Nodemailer
    await transporter.sendMail({
      from: `"FoundAlert" <${process.env.EMAIL_USER}>`, // Uses your verified Gmail address
      to: params.email,
      subject: `Someone found your ${params.itemName}!`,
      html: `
        <h2>Good news! Your ${params.itemName} has been found.</h2>
        ${message ? `<p><strong>Message from finder:</strong> ${message}</p>` : ""}
        ${finderContact ? `<p><strong>Contact info:</strong> ${finderContact}</p>` : ""}
        <p><a href="${frontendUrl}/dashboard/reports/${id}">Click here to view the exact location and details</a></p>
      `,
    });

    // 2. If successful, mark as SENT, record the time, and increment attempts
    await prisma.notificationLog.update({
      where: { id: params.logId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        attempts: { increment: 1 },
      },
    });
  } catch (error: any) {
    // 3. If it fails, mark as FAILED, save the error message, and increment attempts
    console.error(`Email delivery failed for log ${params.logId}:`, error);

    await prisma.notificationLog.update({
      where: { id: params.logId },
      data: {
        status: "FAILED",
        lastError: error.message || "Unknown error occurred",
        attempts: { increment: 1 },
      },
    });
  }
};
