// import { prisma } from "../config/prisma.js";
// import crypto from "crypto";
// const ENCRYPTION_KEY = process.env.WEBHOOK_ENCRYPTION_KEY as string;
// const ALGORITHM = "aes-256-cbc";
// if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
//   throw new Error("WEBHOOK_ENCRYPTION_KEY must be exactly 32 bytes long.");
// }
// export const encryptSecret = (plainText: string): string => {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(
//     ALGORITHM,
//     Buffer.from(ENCRYPTION_KEY),
//     iv,
//   );
//   let encrypted = cipher.update(plainText);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return iv.toString("hex") + ":" + encrypted.toString("hex");
// };

// export const decryptSecret = (encryptedText: string): string => {
//   const textParts = encryptedText.split(":");
//   const iv = Buffer.from(textParts.shift() as string, "hex");
//   const encryptedData = Buffer.from(textParts.join(":"), "hex");
//   const decipher = crypto.createDecipheriv(
//     ALGORITHM,
//     Buffer.from(ENCRYPTION_KEY),
//     iv,
//   );
//   let decrypted = decipher.update(encryptedData);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// };
// export const dispatchOwnerWebhook = async (userId: string, payload: any) => {
//   // 1. Find the active webhook for this user
//   const webhook = await prisma.webhookConfig.findFirst({
//     where: { userId, isActive: true },
//   });

//   if (!webhook) return; // Exit silently if they don't have active webhooks configured

//   // 2. Decrypt secret & prepare payload
//   const decryptedSecret = decryptSecret(webhook.secret);
//   const payloadString = JSON.stringify(payload);

//   // 3. Generate HMAC signature
//   const signature = crypto
//     .createHmac("sha256", decryptedSecret)
//     .update(payloadString)
//     .digest("hex");

//   try {
//     // 4. Dispatch the HTTP POST request (Uses native Node 18+ fetch)
//     const response = await fetch(webhook.url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Webhook-Signature": signature,
//       },
//       body: payloadString,
//       // Optional: Add a timeout using AbortController so it doesn't hang forever
//     });

//     if (!response.ok) {
//       throw new Error(`Destination responded with HTTP ${response.status}`);
//     }

//     // 5. Success: Reset the circuit breaker if it had previous failures
//     if (webhook.failureCount > 0) {
//       await prisma.webhookConfig.update({
//         where: { id: webhook.id },
//         data: { failureCount: 0 },
//       });
//     }
//   } catch (error) {
//     // 6. Failure: Increment circuit breaker
//     const newFailureCount = webhook.failureCount + 1;
//     const shouldDisable = newFailureCount >= 5; // Kill switch after 5 consecutive fails

//     await prisma.webhookConfig.update({
//       where: { id: webhook.id },
//       data: {
//         failureCount: newFailureCount,
//         isActive: !shouldDisable,
//       },
//     });

//     console.error(
//       `Webhook dispatch failed for User ${userId}. Failures: ${newFailureCount}`,
//     );
//   }
// };
