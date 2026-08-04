// this file bascially notify the owner of the item when the item is scanned by a user and the owner has configured a webhook for that item

import { prisma } from "../config/prisma.js";

import crypto from "crypto";

// Ensure this environment variable is exactly 32 characters long

const ENCRYPTION_KEY = process.env.WEBHOOK_ENCRYPTION_KEY as string;
//we need ENCRYPTION_KEY  to encrypt the secret before saving it to the database and decrypt it when we need to use it to sign the payload for the webhook dispatch. The encryption key must be exactly 32 bytes long for AES-256-CBC.
const ALGORITHM = "aes-256-cbc";
//256 refers to the Key Size (in bits). Your master combination lock key is 256 bits long (which equals 32 bytes). It dictates how complex the mathematical gears are inside the lock.

// 16 bytes refers to the Block Size. This is the size of the box the data is chopped into.
// The encryption algorithm (AES) cannot take a message of any random length and encrypt it all in one giant go. It forces you to pack your data into rigid, fixed-size boxes called blocks (specifically, 16-byte blocks for AES).
//AES stands for Advanced Encryption Standard. It is a globally trusted, bank-grade encryption algorithm used by governments and tech giants to secure sensitive data.
//This means it uses a 256-bit key length
//CBC: Stands for Cipher Block Chaining.. It scrambles your data in chained blocks so that patterns in your secret text are hidden.
//Block Division: It chops your secret text into blocks (usually 16 bytes each).

// The XOR Chain (The Magic Step): Before encrypting Block #1, it mixes (XORs) it with a random starting block called the IV (Initialization Vector).

// The Chain Reaction: Once Block #1 is encrypted, the result is literally mixed into Block #2 before Block #2 is encrypted. Then Block #2's result is mixed into Block #3, and so on down the line
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("WEBHOOK_ENCRYPTION_KEY must be exactly 32 bytes long.");
}

/**

 * Encrypts the raw secret before saving it to Prisma.

 * Call this when the user CREATES the webhook.

 */

export const encryptSecret = (plainText: string): string => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ALGORITHM, // AES-256-CBC algorithm for encryption
    Buffer.from(ENCRYPTION_KEY),
    //Takes your 32-character master password string and converts it into raw binary data (Buffer) that the computer's CPU can read mathematically.
    iv,
    //iv (Initialization Vector): A random 16-byte value ("salt") passed into the function. It ensures that even if two different users happen to have the exact same secret password, the encrypted result stored in your database will look completely different every time
  );

  let encrypted = cipher.update(plainText);
  //AES strictly demands that every single box sent through it must be completely full (16 bytes). It will not accept a half-empty box of 4 bytes.
  //cipher.update() only processed the first full box (the 16 bytes). It left those last 4 padded bytes sitting in the machine's internal staging area.
  // To fix this, cryptography uses something called padding. The system automatically pads (fills up) those remaining 4 bytes with extra filler data so it reaches a full 16 bytes.
  //Computers work with raw chunks of memory called Buffers.
  //Because your text was processed in pieces, you end up with two separate pieces of encrypted output: the main body (encrypted) and that last little trailing piece (cipher.final()).
  //Buffer.concat() takes those separate pieces and stitches them together end-to-end into one single, complete, unified block of encrypted data so you can safely save it to your database.
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  //When the encryption machine finishes processing your main text chunks (cipher.update), there is usually a tiny fragment of data left over at the very end (due to how block padding works in cryptography). cipher.final() flushes out that last remaining block of encrypted data.

  //cipher.update() processes all the full boxes it can right away and hands them back to you.

  // cipher.final() handles whatever text is left over, fills the last box with padding, and encrypts it.

  // Buffer.concat() takes all those individual encrypted boxes and stitches them together into one single string so you can save it safely in your database.

  // You completely unlocked how the data flows through the encryption pipeline.
  return iv.toString("hex") + ":" + encrypted.toString("hex");
  //.toString("hex") converts raw bytes into a readable hexadecimal string (like a3f9c2...).
};

/**

 * Decrypts the secret pulled from Prisma.

 */

export const decryptSecret = (encryptedText: string): string => {
  const textParts = encryptedText.split(":");

  const iv = Buffer.from(textParts.shift() as string, "hex");
  //as string: Reassures TypeScript that it's definitely text, not undefined.
  // we r fetching the iv and encrypted data from the database and converting them back to raw bytes using Buffer.from() so we can feed them into the decryption algorithm.
  const encryptedData = Buffer.from(textParts.join(":"), "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );

  let decrypted = decipher.update(encryptedData);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

//Build the machine (createCipheriv for locking, createDecipheriv for unlocking) using your Master Key and IV.

// Push the data through (cipher.update or decipher.update) to process the main chunks of text.

// Flush the leftovers (cipher.final or decipher.final) to catch the very last pieces and handle padding.

// Stitch it together (Buffer.concat) so you end up with one complete, unified result.
/**

 * Dispatches the webhook to the owner's URL when an item is scanned.

 * Includes HMAC signing and Circuit Breaker logic.

 */

export const dispatchOwnerWebhook = async (userId: string, payload: any) => {
  // 1. Find the active webhook for this user

  const webhook = await prisma.webhookConfig.findFirst({
    where: { userId, isActive: true },
  });

  if (!webhook) return; // Exit silently if they don't have active webhooks configured

  // 2. Decrypt secret & prepare payload

  const decryptedSecret = decryptSecret(webhook.secret);

  const payloadString = JSON.stringify(payload);
  //JSON.stringify() acts as a translator: it flattens your structured object into a standard text string so it can be safely handled.

  // 3. Generate HMAC signature

  const signature = crypto

    .createHmac("sha256", decryptedSecret)

    .update(payloadString)

    .digest("hex");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    // 4. Dispatch the HTTP POST request (Uses native Node 18+ fetch)

    const response = await fetch(webhook.url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "X-Webhook-Signature": signature,
      },

      body: payloadString,
      signal: controller.signal,
      // Optional: Add a timeout using AbortController so it doesn't hang forever
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Destination responded with HTTP ${response.status}`);
    }

    // 5. Success: Reset the circuit breaker if it had previous failures

    if (webhook.failureCount > 0) {
      await prisma.webhookConfig.update({
        where: { id: webhook.id },

        data: { failureCount: 0 },
      });
    }
  } catch (error) {
    // 6. Failure: Increment circuit breaker

    const newFailureCount = webhook.failureCount + 1;

    const shouldDisable = newFailureCount >= 5; // Kill switch after 5 consecutive fails

    await prisma.webhookConfig.update({
      where: { id: webhook.id },

      data: {
        failureCount: newFailureCount,

        isActive: !shouldDisable,
      },
    });

    console.error(
      `Webhook dispatch failed for User ${userId}. Failures: ${newFailureCount}`,
    );
  }
};
