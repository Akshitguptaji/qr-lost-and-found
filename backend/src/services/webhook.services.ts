import { prisma } from "../config/prisma.js";

import { NotificationStatus } from "@prisma/client"; // <-- Import the enum here
//type:-what kind of event happened, data: An object containing the actual details of the event.
export const processDeliveryUpdate = async (type: string, data: any) => {
  if (!data?.email_id) return; // Guard clause

  if (type === "email.delivered") {
    await prisma.notificationLog.updateMany({
      where: { providerId: data.email_id },

      data: { status: NotificationStatus.DELIVERED }, // <-- Use the enum
    });
  }

  if (type === "email.bounced" || type === "email.complained") {
    await prisma.notificationLog.updateMany({
      where: { providerId: data.email_id },

      data: {
        status: NotificationStatus.FAILED, // <-- Use the enum

        lastError: `Webhook reported: ${type}`,
      },
    });
  }
};
