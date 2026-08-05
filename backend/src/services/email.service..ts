import { prisma } from "../config/prisma.js";
import type { FoundReport } from "@prisma/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { id, message, finderContact } = params.reportData;

    // FIX 1: Destructure { data, error } exactly like this. Do not use 'const info ='
    // FIX 2: Hardcode the onboarding email for testing so Resend doesn't block you
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Hardcoded for testing
      to: "mailtoakshitji123@gmail.com", // Hardcoded for testing
      subject: `Someone found your ${params.itemName}!`,
      html: `
          <h2>Good news! Your ${params.itemName} has been found.</h2>
          ${message ? `<p><strong>Message from finder:</strong> ${message}</p>` : ""}
          ${finderContact ? `<p><strong>Contact info:</strong> ${finderContact}</p>` : ""}
          <p><a href="${frontendUrl}/dashboard/reports/${id}">Click here to view the exact location and details</a></p>
        `,
    });

    // Now 'error' exists and can be checked
    if (error) {
      console.error(`Resend API failed for log ${params.logId}:`, error);
      await prisma.notificationLog.update({
        where: { id: params.logId },
        data: {
          status: "FAILED",
          lastError: error.message,
          attempts: { increment: 1 },
        },
      });
      return;
    }

    // Now 'data' exists and can be used for the providerId
    await prisma.notificationLog.update({
      where: { id: params.logId },
      data: {
        status: "SENT",
        providerId: data?.id,
        sentAt: new Date(),
        attempts: { increment: 1 },
      },
    });
  } catch (catchError: any) {
    // FIX 3: Renamed this to 'catchError' so it doesn't conflict with Resend's 'error'
    console.error(`Email delivery failed for log ${params.logId}:`, catchError);
    await prisma.notificationLog.update({
      where: { id: params.logId },
      data: {
        status: "FAILED",
        lastError: catchError.message || "Unknown error occurred",
        attempts: { increment: 1 },
      },
    });
  }
};
// // This handles Nodemailer logic to fire off alerts to the owner.
// import { prisma } from "../config/prisma.js";
// // import nodemailer from "nodemailer";
// import type { FoundReport } from "@prisma/client";
// // import { error } from "better-auth/api";
// import { Resend } from "resend";
// const resend = new Resend(process.env.RESEND_API_KEY);
// // Set up the Nodemailer transporter using Gmail
// // Do this OUTSIDE the function so it doesn't rebuild the connection every single time
// // const transporter = nodemailer.createTransport({
// //   host: "smtp.ethereal.email",
// //   port: 587,
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });
// const frontendUrl = process.env.FRONTEND_URL;
// if (!frontendUrl) {
//   throw new Error(
//     "CRITICAL: FRONTEND_URL is missing from environment variables.",
//   );
// }
// export interface NotificationParams {
//   email: string;
//   itemName: string;
//   reportData: FoundReport;
//   logId: string;
// }

// export const sendOwnerNotification = async (params: NotificationParams) => {
//   try {
//     // Destructure reportData for cleaner code inside the HTML
//     const { id, message, finderContact } = params.reportData;

//     // 1. Send the email via Nodemailer
//     const info = await resend.emails.send({
//       from: `"FoundAlert" <${process.env.EMAIL_USER}>`, // Uses your verified Gmail address
//       to: params.email,
//       subject: `Someone found your ${params.itemName}!`,
//       html: `
//         <h2>Good news! Your ${params.itemName} has been found.</h2>
//         ${message ? `<p><strong>Message from finder:</strong> ${message}</p>` : ""}
//         ${finderContact ? `<p><strong>Contact info:</strong> ${finderContact}</p>` : ""}
//         <p><a href="${frontendUrl}/dashboard/reports/${id}">Click here to view the exact location and details</a></p>
//       `,
//     });

//     if (error) {
//       console.error(`Resend API failed for log ${params.logId}:`, error);
//       await prisma.notificationLog.update({
//         where: { id: params.logId },
//         data: {
//           status: "FAILED",
//           lastError: error.message,
//           attempts: { increment: 1 },
//         },
//       });
//       return;
//     }
//     // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//     // console.log("Message sent: %s", info.messageId);
//     // 2. If successful, mark as SENT, record the time, and increment attempts
//     await prisma.notificationLog.update({
//       where: { id: params.logId },
//       data: {
//         status: "SENT",
//         providerId: data?.id, // Assuming 'data.id' is the unique identifier from the email provider
//         sentAt: new Date(),
//         attempts: { increment: 1 },
//       },
//     });
//   }

//   catch (error: any) {
//     // 3. If it fails, mark as FAILED, save the error message, and increment attempts
//     console.error(`Email delivery failed for log ${params.logId}:`, error);

//     await prisma.notificationLog.update({
//       where: { id: params.logId },
//       data: {
//         status: "FAILED",
//         lastError: error.message || "Unknown error occurred",
//         attempts: { increment: 1 },
//       },
//     });
//   }
// };
